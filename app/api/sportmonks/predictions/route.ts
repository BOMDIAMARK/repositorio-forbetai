import { NextResponse } from "next/server"
import { fetchPredictionsByDate } from "@/lib/sportmonks-api-client"
import { cacheManager } from "@/lib/redis-cache"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  console.log(`🔮 API Route chamada para predições da data: ${date}`)

  if (!date) {
    return NextResponse.json({ error: "Parâmetro 'date' é obrigatório (formato: YYYY-MM-DD)" }, { status: 400 })
  }

  // Validar formato da data
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Formato de data inválido. Use YYYY-MM-DD" }, { status: 400 })
  }

  try {
    // Verificar cache primeiro
    const cachedPredictions = await cacheManager.getPredictions(undefined, date)
    
    if (cachedPredictions) {
      console.log(`📋 Cache hit para predições da data ${date}`)
      return NextResponse.json({
        data: cachedPredictions,
        cached: true,
        timestamp: new Date().toISOString()
      })
    }

    // Buscar predições da SportMonks
    console.log(`🚀 Buscando predições da SportMonks para data: ${date}`)
    const predictions = await fetchPredictionsByDate(date)
    
    // Processar predições para formato enriquecido
    const processedPredictions = predictions.map(prediction => ({
      fixture_id: prediction.fixture_id,
      fixture_name: prediction.fixture?.name,
      league: prediction.fixture?.league?.name,
      country: prediction.fixture?.league?.country?.name,
      starting_at: prediction.fixture?.starting_at,
      probabilities: {
        home_win: prediction.predictions?.home_win_probability,
        draw: prediction.predictions?.draw_probability,
        away_win: prediction.predictions?.away_win_probability,
        over_2_5: prediction.predictions?.over_2_5_probability,
        under_2_5: prediction.predictions?.under_2_5_probability,
        both_teams_score: prediction.predictions?.both_teams_score_probability
      },
      confidence: prediction.predictions?.confidence_level,
      algorithm_version: prediction.predictions?.version,
      data_source: 'SportMonks Professional',
      processed_at: new Date().toISOString()
    }))

    // Cache com TTL otimizado para predições
    await cacheManager.setPredictions(processedPredictions, undefined, date)
    
    console.log(`✅ ${processedPredictions.length} predições processadas para ${date}`)
    
    return NextResponse.json({
      data: processedPredictions,
      cached: false,
      timestamp: new Date().toISOString(),
      total: processedPredictions.length
    })
    
  } catch (error: any) {
    console.error(`❌ Erro ao buscar predições para ${date}:`, {
      message: error.message,
      stack: error.stack
    })
    
    return NextResponse.json({ 
      error: error.message || "Erro ao buscar predições.",
      debug: {
        date,
        hasApiKey: !!process.env.SPORTMONKS_API_KEY,
        baseUrl: process.env.SPORTMONKS_BASE_URL
      }
    }, { status: 500 })
  }
} 