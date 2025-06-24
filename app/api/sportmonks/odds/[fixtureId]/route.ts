import { NextResponse } from "next/server"
import { fetchFixtureOddsDetailed } from "@/lib/sportmonks-api-client"
import { cacheManager } from "@/lib/redis-cache"
import { getBestOdds, SportMonksOdd } from "@/lib/odds-mapper"

interface RouteContext {
  params: {
    fixtureId: string
  }
}

export async function GET(request: Request, context: RouteContext) {
  const { fixtureId } = context.params

  console.log(`🎰 API Route chamada para odds da fixture: ${fixtureId}`)

  if (!fixtureId || isNaN(Number(fixtureId))) {
    console.error(`❌ Fixture ID inválido para odds: ${fixtureId}`)
    return NextResponse.json({ error: "Fixture ID inválido." }, { status: 400 })
  }

  try {
    // Verificar cache primeiro
    const cachedOdds = await cacheManager.getOdds(fixtureId)
    
    if (cachedOdds) {
      console.log(`📋 Cache hit para odds da fixture ${fixtureId}`)
      return NextResponse.json({
        data: cachedOdds,
        cached: true,
        timestamp: new Date().toISOString()
      })
    }

    // Buscar odds detalhadas da SportMonks
    console.log(`🚀 Buscando odds detalhadas da SportMonks para fixture: ${fixtureId}`)
    const rawOdds = await fetchFixtureOddsDetailed(Number(fixtureId))
    
    if (!rawOdds || rawOdds.length === 0) {
      console.warn(`⚠️ Nenhuma odd encontrada para fixture: ${fixtureId}`)
      return NextResponse.json({ 
        error: "Odds não encontradas para esta partida.",
        note: "Odds podem não estar disponíveis para partidas já finalizadas ou muito futuras."
      }, { status: 404 })
    }

    // Processar odds para formato unificado e enriquecido
    const processedOdds = processDetailedOdds(rawOdds, Number(fixtureId))
    
    // Salvar no cache com TTL otimizado para odds
    await cacheManager.setOdds(fixtureId, processedOdds)
    
    console.log(`✅ ${rawOdds.length} odds processadas para fixture: ${fixtureId}`)
    return NextResponse.json({
      data: processedOdds,
      cached: false,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error(`❌ Erro ao buscar odds para fixture ${fixtureId}:`, {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json({ 
      error: error.message || "Erro ao buscar odds da partida.",
      debug: {
        fixtureId,
        hasApiKey: !!process.env.SPORTMONKS_API_KEY,
        baseUrl: process.env.SPORTMONKS_BASE_URL
      }
    }, { status: 500 })
  }
}

function processDetailedOdds(rawOdds: any[], fixtureId: number) {
  const bookmakerData = new Map<string, any>()
  const marketSummary = new Map<string, any[]>()
  
  // Organizar odds por bookmaker e market
  for (const odd of rawOdds) {
    const bookmakerId = odd.bookmaker?.id || 'unknown'
    const bookmakerName = odd.bookmaker?.name || 'Unknown Bookmaker'
    const marketName = odd.market?.name || 'Unknown Market'
    
    // Inicializar bookmaker se não existir
    if (!bookmakerData.has(bookmakerId)) {
      bookmakerData.set(bookmakerId, {
        id: bookmakerId,
        name: bookmakerName,
        logo: odd.bookmaker?.logo,
        markets: new Map()
      })
    }
    
    // Adicionar odd ao bookmaker
    const bookmaker = bookmakerData.get(bookmakerId)
    if (bookmaker) {
      if (!bookmaker.markets.has(marketName)) {
        bookmaker.markets.set(marketName, [])
      }
      const marketOdds = bookmaker.markets.get(marketName)
      if (marketOdds) {
        marketOdds.push(odd)
      }
    }
    
    // Adicionar ao resumo por market
    if (!marketSummary.has(marketName)) {
      marketSummary.set(marketName, [])
    }
    const marketOdds = marketSummary.get(marketName)
    if (marketOdds) {
      marketOdds.push(odd)
    }
  }
  
  // Processar melhores odds usando o mapeador existente
  const formattedOdds: SportMonksOdd[] = rawOdds.map(odd => ({
    id: odd.id,
    fixture_id: fixtureId,
    market_id: odd.market?.id,
    bookmaker_id: odd.bookmaker?.id,
    label: odd.label,
    value: odd.value,
    name: odd.name,
    sort_order: odd.sort_order || 0,
    market_description: odd.market?.name || '',
    probability: odd.probability,
    dp3: odd.dp3,
    fractional: odd.fractional,
    american: odd.american,
    winning: odd.winning,
    stopped: odd.stopped,
    total: odd.total,
    handicap: odd.handicap,
    participants: odd.participants
  }))
  
  const bestOdds = getBestOdds(formattedOdds)
  
  // Criar resposta enriquecida
  const bookmakers = Array.from(bookmakerData.values()).map(bookmaker => {
    const markets = Array.from(bookmaker.markets.entries()).map(entry => {
      const [marketName, odds] = entry as [string, any[]]
      return {
        market_name: marketName,
        selections: odds.map((odd: any) => ({
          label: odd.label,
          value: parseFloat(odd.value),
          probability: odd.probability,
          fractional: odd.fractional,
          american: odd.american
        }))
      }
    })
    
    return {
      id: bookmaker.id,
      name: bookmaker.name,
      logo: bookmaker.logo,
      markets: markets
    }
  })
  
  const marketAnalysis = Array.from(marketSummary.entries()).map(entry => {
    const [marketName, odds] = entry as [string, any[]]
    const values = odds.map((o: any) => parseFloat(o.value)).filter(v => !isNaN(v))
    return {
      market_name: marketName,
      bookmaker_count: new Set(odds.map((o: any) => o.bookmaker?.id)).size,
      min_odd: values.length > 0 ? Math.min(...values) : 0,
      max_odd: values.length > 0 ? Math.max(...values) : 0,
      avg_odd: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
      margin_percentage: calculateMarketMargin(odds)
    }
  })
  
  const processedOdds = {
    fixture_id: fixtureId,
    best_odds: bestOdds,
    bookmakers: bookmakers,
    market_analysis: marketAnalysis,
    data_quality: {
      total_odds_count: rawOdds.length,
      bookmaker_count: bookmakerData.size,
      market_count: marketSummary.size,
      data_freshness: 'real-time',
      last_updated: new Date().toISOString()
    }
  }
  
  return processedOdds
}

function calculateMarketMargin(odds: any[]): number {
  // Calcular margem da casa para mercados 1X2
  const homeOdds = odds.find(o => o.label?.toLowerCase() === 'home')
  const drawOdds = odds.find(o => o.label?.toLowerCase() === 'draw')
  const awayOdds = odds.find(o => o.label?.toLowerCase() === 'away')
  
  if (homeOdds && drawOdds && awayOdds) {
    const homeProb = 1 / parseFloat(homeOdds.value)
    const drawProb = 1 / parseFloat(drawOdds.value)
    const awayProb = 1 / parseFloat(awayOdds.value)
    
    const totalProb = homeProb + drawProb + awayProb
    return ((totalProb - 1) * 100) // Margem em percentual
  }
  
  return 0
} 