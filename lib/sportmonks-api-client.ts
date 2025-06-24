import type { SportMonksFixture, SportMonksFixtureDetails } from "@/app/(platform)/predicoes/types-sportmonks"

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

export async function fetchFixturesByDate(date: string): Promise<SportMonksFixture[]> {
  console.log(`🏈 Buscando fixtures para data: ${date}`)
  
  // Validar formato da data
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Formato de data inválido: ${date}. Use YYYY-MM-DD`)
  }
  
  // Includes simplificados - apenas participants que já está testado e funcionando
  const includes = "participants"
  const endpoint = `/football/fixtures/between/${date}/${date}?include=${includes}`

  try {
    const response = await fetchSportMonksApi<{ data: SportMonksFixture[] }>(endpoint)
    
    const fixtures = response.data || []
    console.log(`📊 Encontradas ${fixtures.length} fixtures para ${date}`)
    
    // Log de sample dos dados se houver fixtures
    if (fixtures.length > 0) {
      const sample = fixtures[0]
      console.log(`📋 Sample fixture:`, {
        id: sample.id,
        name: sample.name,
        starting_at: sample.starting_at,
        hasLeague: !!sample.league,
        hasParticipants: !!sample.participants,
        participantsCount: sample.participants?.length || 0,
        hasScores: !!sample.scores
      })
    }

    return fixtures
    
  } catch (error) {
    console.error(`❌ Erro em fetchFixturesByDate para ${date}:`, error)
    // Em vez de retornar array vazio, propagar o erro para melhor debug
    throw error
  }
}

export async function fetchFixtureDetails(fixtureId: number): Promise<SportMonksFixtureDetails | null> {
  console.log(`🔍 Buscando detalhes da fixture: ${fixtureId}`)
  
  // Validar ID
  if (!fixtureId || isNaN(fixtureId) || fixtureId <= 0) {
    throw new Error(`ID de fixture inválido: ${fixtureId}`)
  }
  
  // Includes simplificados - apenas participants para começar
  const includes = "participants"
  const endpoint = `/football/fixtures/${fixtureId}?include=${includes}`

  try {
    const response = await fetchSportMonksApi<{ data: SportMonksFixtureDetails }>(endpoint, true)
    
    const fixture = response.data || null
    
    if (fixture) {
      console.log(`📋 Detalhes da fixture ${fixtureId}:`, {
        id: fixture.id,
        name: fixture.name,
        starting_at: fixture.starting_at,
        hasLeague: !!fixture.league,
        hasParticipants: !!fixture.participants,
        hasScores: !!fixture.scores,
        hasStatistics: !!fixture.statistics,
        hasPeriods: !!fixture.periods
      })
    } else {
      console.warn(`⚠️ Nenhum dado retornado para fixture ${fixtureId}`)
    }
    
    return fixture
    
  } catch (error) {
    console.error(`❌ Erro em fetchFixtureDetails para ID ${fixtureId}:`, error)
    // Retornar null em vez de propagar erro para detalhes
    return null
  }
}
