import type { SportMonksFixture, SportMonksFixtureDetails } from "@/app/(platform)/predicoes/types-sportmonks"
import { SportMonksOdd, ProcessedOdds, getBestOdds } from './odds-mapper'

const API_BASE_URL = process.env.SPORTMONKS_BASE_URL || "https://api.sportmonks.com/v3"
const API_KEY = process.env.SPORTMONKS_API_KEY

// Função para validar configuração da API
function validateApiConfig() {
  if (!API_KEY) {
    console.error("❌ SPORTMONKS_API_KEY não está configurada!")
    console.error("📝 Crie um arquivo .env.local com:")
    console.error("   SPORTMONKS_API_KEY=sua_chave_aqui")
    console.error("   SPORTMONKS_BASE_URL=https://api.sportmonks.com/v3")
    throw new Error("SportMonks API key is not configured. Please check your .env.local file.")
  }
  
  if (!API_BASE_URL) {
    console.error("❌ SPORTMONKS_BASE_URL não está configurada!")
    throw new Error("SportMonks Base URL is not configured.")
  }
  
  console.log("✅ SportMonks API configurada corretamente")
  console.log(`🔗 Base URL: ${API_BASE_URL}`)
  console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}...`)
}

// Função para fazer retry em caso de falha
async function retryFetch(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries}: ${url.replace(API_KEY!, "REDACTED_API_KEY")}`)
      const response = await fetch(url, options)
      
      if (response.ok) {
        console.log(`✅ Sucesso na tentativa ${attempt}`)
        return response
      }
      
      // Se for erro 4xx, não tenta novamente (erro de cliente)
      if (response.status >= 400 && response.status < 500) {
        const errorBody = await response.text()
        console.error(`❌ Erro de cliente (${response.status}): ${errorBody}`)
        throw new Error(`Client error (${response.status}): ${errorBody}`)
      }
      
      // Para erros 5xx, tenta novamente
      console.warn(`⚠️ Erro de servidor (${response.status}) na tentativa ${attempt}`)
      lastError = new Error(`Server error: ${response.status} ${response.statusText}`)
      
    } catch (error) {
      console.error(`❌ Erro na tentativa ${attempt}:`, error)
      lastError = error as Error
      
      // Se não for o último retry, espera antes de tentar novamente
      if (attempt < maxRetries) {
        const delay = attempt * 1000 // 1s, 2s, 3s...
        console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError || new Error("Max retries exceeded")
}

async function fetchSportMonksApi<T>(endpoint: string, isDetailFetch = false): Promise<T> {
  // Validar configuração primeiro
  validateApiConfig()
  
  const url = `${API_BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_token=${API_KEY}`
  
  console.log(`🚀 Iniciando requisição SportMonks...`)
  console.log(`📍 Endpoint: ${endpoint}`)
  console.log(`🔗 URL: ${url.replace(API_KEY!, "REDACTED_API_KEY")}`)

  try {
    const options: RequestInit = { 
      next: { revalidate: isDetailFetch ? 600 : 300 },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ForBetAI/1.0'
      }
    }
    
    const response = await retryFetch(url, options)
    
    console.log(`✅ Response Status: ${response.status} ${response.statusText}`)
    console.log(`📊 Content-Type: ${response.headers.get('content-type')}`)
    
    const json = await response.json()
    
    // Log detalhado da resposta (apenas estrutura, não dados completos)
    console.log(`📦 Response structure:`, {
      hasData: !!json.data,
      dataType: Array.isArray(json.data) ? 'array' : typeof json.data,
      dataLength: Array.isArray(json.data) ? json.data.length : 'N/A',
      hasError: !!json.error,
      hasMeta: !!json.meta,
      topLevelKeys: Object.keys(json)
    })
    
    return json
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Erro final na requisição SportMonks:`, errorMessage)
    console.error(`🔗 URL que falhou: ${url.replace(API_KEY!, "REDACTED_API_KEY")}`)
    
    throw new Error(`Erro ao buscar dados da SportMonks: ${errorMessage}`)
  }
}

// Função para buscar fixture básica com participantes
export async function fetchFixturesByDate(date: string): Promise<SportMonksFixture[]> {
  console.log(`🏈 Buscando fixtures para data: ${date}`)
  
  // Validar formato da data
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Formato de data inválido: ${date}. Use YYYY-MM-DD`)
  }
  
  // Includes expandidos para carregar odds básicas na lista
  const includes = "participants,odds"
  const endpoint = `/football/fixtures/between/${date}/${date}?include=${includes}`

  try {
    const response = await fetchSportMonksApi<{ data: SportMonksFixture[] }>(endpoint)
    
    const fixtures = response.data || []
    console.log(`📊 Encontradas ${fixtures.length} fixtures para ${date}`)
    
    // Processar odds básicas se disponíveis
    const processedFixtures = fixtures.map((fixture: any) => {
      if (fixture.odds && fixture.odds.length > 0) {
        const rawOdds = fixture.odds as SportMonksOdd[]
        const processedOdds = getBestOdds(rawOdds)
        
        return {
          ...fixture,
          rawOdds,
          processedOdds
        }
      }
      
      return fixture
    })
    
    // Log de sample dos dados se houver fixtures
    if (processedFixtures.length > 0) {
      const sample = processedFixtures[0]
      console.log(`📋 Sample fixture:`, {
        id: sample.id,
        name: sample.name,
        starting_at: sample.starting_at,
        hasLeague: !!sample.league,
        hasParticipants: !!sample.participants,
        hasOdds: !!sample.rawOdds,
        participantsCount: sample.participants?.length || 0,
        oddsCount: sample.rawOdds?.length || 0
      })
    }

    return processedFixtures
    
  } catch (error) {
    console.error(`❌ Erro em fetchFixturesByDate para ${date}:`, error)
    // Em vez de retornar array vazio, propagar o erro para melhor debug
    throw error
  }
}

// Função para buscar detalhes completos de uma fixture
export async function fetchFixtureDetails(fixtureId: number): Promise<SportMonksFixtureDetails | null> {
  console.log(`🔍 Buscando detalhes completos da fixture: ${fixtureId}`)
  
  // Validar ID
  if (!fixtureId || isNaN(fixtureId) || fixtureId <= 0) {
    throw new Error(`ID de fixture inválido: ${fixtureId}`)
  }

  try {
    // Buscar dados básicos com participants e odds
    const [basicData, statistics, scores, state, odds] = await Promise.allSettled([
      fetchSportMonksApi<{ data: SportMonksFixtureDetails }>(`/football/fixtures/${fixtureId}?include=participants`, true),
      fetchSportMonksApi<{ data: any[] }>(`/football/fixtures/${fixtureId}?include=statistics`, true),
      fetchSportMonksApi<{ data: any[] }>(`/football/fixtures/${fixtureId}?include=scores`, true),
      fetchSportMonksApi<{ data: any }>(`/football/fixtures/${fixtureId}?include=state`, true),
      fetchSportMonksApi<{ data: any }>(`/football/fixtures/${fixtureId}?include=odds`, true)
    ])

    // Verificar se os dados básicos foram obtidos com sucesso
    if (basicData.status !== 'fulfilled') {
      console.error(`❌ Falha ao buscar dados básicos da fixture ${fixtureId}:`, basicData.reason)
      return null
    }

    const fixture = basicData.value.data as any

    if (!fixture) {
      console.warn(`⚠️ Nenhum dado retornado para fixture ${fixtureId}`)
      return null
    }

    // Adicionar statistics se disponível
    if (statistics.status === 'fulfilled' && statistics.value.data) {
      fixture.statistics = statistics.value.data
      console.log(`📊 ${statistics.value.data.length} estatísticas carregadas`)
    } else {
      console.warn(`⚠️ Estatísticas não disponíveis:`, statistics.status === 'rejected' ? statistics.reason : 'No data')
    }

    // Adicionar scores se disponível
    if (scores.status === 'fulfilled' && scores.value.data) {
      fixture.scores = scores.value.data
      console.log(`⚽ ${scores.value.data.length} scores carregados`)
    } else {
      console.warn(`⚠️ Scores não disponíveis:`, scores.status === 'rejected' ? scores.reason : 'No data')
    }

    // Adicionar state se disponível
    if (state.status === 'fulfilled' && state.value.data) {
      fixture.state = state.value.data
      console.log(`🎯 State carregado: ${state.value.data.name}`)
    } else {
      console.warn(`⚠️ State não disponível:`, state.status === 'rejected' ? state.reason : 'No data')
    }

    // Processar odds se disponível
    if (odds.status === 'fulfilled' && odds.value.data?.odds) {
      const rawOdds = odds.value.data.odds as SportMonksOdd[]
      const processedOdds = getBestOdds(rawOdds)
      
      fixture.rawOdds = rawOdds
      fixture.processedOdds = processedOdds
      
      console.log(`💰 ${rawOdds.length} odds processadas:`, {
        hasFullTimeResult: !!processedOdds.fullTimeResult,
        hasBothTeamsToScore: !!processedOdds.bothTeamsToScore,
        hasTotalGoals: !!processedOdds.totalGoals,
        hasCorrectScore: !!processedOdds.correctScore,
        hasAsianHandicap: !!processedOdds.asianHandicap
      })
    } else {
      console.warn(`⚠️ Odds não disponíveis:`, odds.status === 'rejected' ? odds.reason : 'No odds data')
    }

    console.log(`📋 Detalhes completos da fixture ${fixtureId}:`, {
      id: fixture.id,
      name: fixture.name,
      starting_at: fixture.starting_at,
      hasParticipants: !!fixture.participants,
      hasScores: !!fixture.scores,
      hasStatistics: !!fixture.statistics,
      hasState: !!fixture.state,
      hasOdds: !!fixture.rawOdds,
      hasProcessedOdds: !!fixture.processedOdds,
      participantsCount: fixture.participants?.length || 0,
      scoresCount: fixture.scores?.length || 0,
      statisticsCount: fixture.statistics?.length || 0,
      oddsCount: fixture.rawOdds?.length || 0
    })

    return fixture as SportMonksFixtureDetails
    
  } catch (error) {
    console.error(`❌ Erro em fetchFixtureDetails para ID ${fixtureId}:`, error)
    // Retornar null em vez de propagar erro para detalhes
    return null
  }
}

// Função para buscar tipos de estatísticas (para traduzir type_ids)
export async function fetchStatisticTypes(): Promise<any[]> {
  console.log(`📋 Buscando tipos de estatísticas...`)
  
  try {
    const endpoint = `/football/types/statistics`
    const response = await fetchSportMonksApi<{ data: any[] }>(endpoint, true)
    
    const types = response.data || []
    console.log(`📊 Encontrados ${types.length} tipos de estatísticas`)
    
    return types
    
  } catch (error) {
    console.error(`❌ Erro ao buscar tipos de estatísticas:`, error)
    return []
  }
}

// Função para buscar odds de uma fixture (se disponível no plano)
export async function fetchFixtureOdds(fixtureId: number): Promise<any[] | null> {
  console.log(`💰 Buscando odds da fixture: ${fixtureId}`)
  
  try {
    const endpoint = `/football/fixtures/${fixtureId}?include=odds`
    const response = await fetchSportMonksApi<{ data: any }>(endpoint, true)
    
    if (response.data && response.data.odds) {
      console.log(`💰 Odds carregadas para fixture ${fixtureId}`)
      return response.data.odds
    }
    
    return null
    
  } catch (error) {
    console.warn(`⚠️ Odds não disponíveis para fixture ${fixtureId}:`, error)
    return null
  }
}
