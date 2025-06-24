import { NextResponse } from "next/server"
import { fetchFixturePredictions } from "@/lib/sportmonks-api-client"
import { cacheManager } from "@/lib/redis-cache"

interface RouteContext {
  params: {
    fixtureId: string
  }
}

export async function GET(request: Request, context: RouteContext) {
  const { fixtureId } = context.params

  console.log(`🔮 API Route chamada para predições da fixture: ${fixtureId}`)

  if (!fixtureId || isNaN(Number(fixtureId))) {
    console.error(`❌ Fixture ID inválido para predições: ${fixtureId}`)
    return NextResponse.json({ error: "Fixture ID inválido." }, { status: 400 })
  }

  try {
    // Verificar cache primeiro
    const cachedPredictions = await cacheManager.getPredictions(fixtureId)
    
    if (cachedPredictions) {
      console.log(`📋 Cache hit para predições da fixture ${fixtureId}`)
      return NextResponse.json({
        data: cachedPredictions,
        cached: true,
        timestamp: new Date().toISOString()
      })
    }

    // Buscar predições da SportMonks
    console.log(`🚀 Buscando predições da SportMonks para fixture: ${fixtureId}`)
    const predictions = await fetchFixturePredictions(Number(fixtureId))
    
    if (!predictions) {
      console.warn(`⚠️ Nenhuma predição encontrada para fixture: ${fixtureId}`)
      return NextResponse.json({ 
        error: "Predições não encontradas para esta partida.",
        note: "Predições podem não estar disponíveis para partidas já finalizadas ou muito antigas."
      }, { status: 404 })
    }

    // Processar predições para formato detalhado
    const processedPredictions = {
      fixture_id: Number(fixtureId),
      algorithm_predictions: {
        match_winner: {
          home_win_probability: predictions.home_win_probability,
          draw_probability: predictions.draw_probability,
          away_win_probability: predictions.away_win_probability,
          most_likely: getMostLikelyOutcome({
            home: predictions.home_win_probability,
            draw: predictions.draw_probability,
            away: predictions.away_win_probability
          })
        },
        goals: {
          over_2_5_probability: predictions.over_2_5_probability,
          under_2_5_probability: predictions.under_2_5_probability,
          over_1_5_probability: predictions.over_1_5_probability,
          under_1_5_probability: predictions.under_1_5_probability,
          both_teams_score_probability: predictions.both_teams_score_probability,
          clean_sheet_probability: predictions.clean_sheet_probability
        },
        scores: {
          correct_score_probabilities: predictions.correct_score_probabilities || [],
          predicted_score: predictions.predicted_score
        }
      },
      confidence_metrics: {
        overall_confidence: predictions.confidence_level,
        data_quality: predictions.data_quality_score,
        model_version: predictions.algorithm_version,
        last_updated: predictions.last_updated
      },
      data_source: 'SportMonks Professional Algorithm',
      generated_at: new Date().toISOString()
    }

    // Cache com TTL otimizado para predições de fixture específica
    await cacheManager.setPredictions(processedPredictions, fixtureId)
    
    console.log(`✅ Predições detalhadas processadas para fixture ${fixtureId}`)
    
    return NextResponse.json({
      data: processedPredictions,
      cached: false,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error(`❌ Erro ao buscar predições para fixture ${fixtureId}:`, {
      message: error.message,
      stack: error.stack
    })
    
    return NextResponse.json({ 
      error: error.message || "Erro ao buscar predições da partida.",
      debug: {
        fixtureId,
        hasApiKey: !!process.env.SPORTMONKS_API_KEY,
        baseUrl: process.env.SPORTMONKS_BASE_URL
      }
    }, { status: 500 })
  }
}

function getMostLikelyOutcome(probabilities: { home: number, draw: number, away: number }) {
  const max = Math.max(probabilities.home, probabilities.draw, probabilities.away)
  
  if (probabilities.home === max) return { outcome: 'home_win', probability: probabilities.home }
  if (probabilities.draw === max) return { outcome: 'draw', probability: probabilities.draw }
  return { outcome: 'away_win', probability: probabilities.away }
} 