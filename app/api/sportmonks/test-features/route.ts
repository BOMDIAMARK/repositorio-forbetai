import { NextResponse } from "next/server"
import { 
  fetchFixturesByDate, 
  fetchFixturePredictions, 
  fetchFixtureOddsDetailed,
  fetchFixtureEnrichedData
} from "@/lib/sportmonks-api-client"
import { cacheManager } from "@/lib/redis-cache"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const feature = searchParams.get('feature') || 'all'
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const fixtureId = searchParams.get('fixtureId')

  console.log(`🧪 Teste das funcionalidades SportMonks - Feature: ${feature}`)

  try {
    const results: any = {
      test_info: {
        feature_tested: feature,
        date_tested: date,
        fixture_id: fixtureId,
        timestamp: new Date().toISOString(),
        api_status: {
          has_api_key: !!process.env.SPORTMONKS_API_KEY,
          base_url: process.env.SPORTMONKS_BASE_URL
        }
      },
      cache_status: cacheManager.getCacheInfo(),
      results: {}
    }

    // Teste 1: Fixtures básicas (sempre executado)
    if (feature === 'all' || feature === 'fixtures') {
      console.log(`🏈 Testando fixtures para data: ${date}`)
      try {
        const fixtures = await fetchFixturesByDate(date)
        results.results.fixtures = {
          status: 'success',
          count: fixtures.length,
          sample: fixtures.slice(0, 2).map(f => ({
            id: f.id,
            name: f.name,
            starting_at: f.starting_at,
            has_participants: !!f.participants?.length
          }))
        }
      } catch (error: any) {
        results.results.fixtures = {
          status: 'error',
          error: error.message
        }
      }
    }

    // Teste 2: Predições (se fixture ID fornecido ou pegar primeira fixture)
    if (feature === 'all' || feature === 'predictions') {
      let testFixtureId = fixtureId
      
      if (!testFixtureId && results.results.fixtures?.sample?.length > 0) {
        testFixtureId = results.results.fixtures.sample[0].id
      }

      if (testFixtureId) {
        console.log(`🔮 Testando predições para fixture: ${testFixtureId}`)
        try {
          const predictions = await fetchFixturePredictions(Number(testFixtureId))
          results.results.predictions = {
            status: predictions ? 'success' : 'no_data',
            fixture_id: testFixtureId,
            has_predictions: !!predictions,
            available_data: predictions ? Object.keys(predictions) : [],
            cache_key: `predictions:fixture:${testFixtureId}`
          }
        } catch (error: any) {
          results.results.predictions = {
            status: 'error',
            fixture_id: testFixtureId,
            error: error.message
          }
        }
      } else {
        results.results.predictions = {
          status: 'skipped',
          reason: 'No fixture ID available for testing'
        }
      }
    }

    // Teste 3: Odds detalhadas
    if (feature === 'all' || feature === 'odds') {
      let testFixtureId = fixtureId
      
      if (!testFixtureId && results.results.fixtures?.sample?.length > 0) {
        testFixtureId = results.results.fixtures.sample[0].id
      }

      if (testFixtureId) {
        console.log(`💰 Testando odds para fixture: ${testFixtureId}`)
        try {
          const odds = await fetchFixtureOddsDetailed(Number(testFixtureId))
          results.results.odds = {
            status: odds && odds.length > 0 ? 'success' : 'no_data',
            fixture_id: testFixtureId,
            odds_count: odds?.length || 0,
            bookmaker_count: odds ? new Set(odds.map((o: any) => o.bookmaker?.id)).size : 0,
            market_count: odds ? new Set(odds.map((o: any) => o.market?.name)).size : 0,
            cache_key: `odds:detailed:${testFixtureId}`
          }
        } catch (error: any) {
          results.results.odds = {
            status: 'error',
            fixture_id: testFixtureId,
            error: error.message
          }
        }
      } else {
        results.results.odds = {
          status: 'skipped',
          reason: 'No fixture ID available for testing'
        }
      }
    }

    // Teste 4: Dados enriquecidos
    if (feature === 'all' || feature === 'enriched') {
      let testFixtureId = fixtureId
      
      if (!testFixtureId && results.results.fixtures?.sample?.length > 0) {
        testFixtureId = results.results.fixtures.sample[0].id
      }

      if (testFixtureId) {
        console.log(`🏆 Testando dados enriquecidos para fixture: ${testFixtureId}`)
        try {
          const enrichedData = await fetchFixtureEnrichedData(Number(testFixtureId))
          results.results.enriched = {
            status: enrichedData ? 'success' : 'no_data',
            fixture_id: testFixtureId,
            has_data: !!enrichedData,
            includes: enrichedData ? {
              participants: !!enrichedData.participants?.length,
              league: !!enrichedData.league,
              venue: !!enrichedData.venue,
              statistics: !!enrichedData.statistics?.length,
              lineups: !!enrichedData.lineups?.length,
              scores: !!enrichedData.scores?.length,
              state: !!enrichedData.state
            } : {},
            cache_key: `enriched:fixture:${testFixtureId}`
          }
        } catch (error: any) {
          results.results.enriched = {
            status: 'error',
            fixture_id: testFixtureId,
            error: error.message
          }
        }
      } else {
        results.results.enriched = {
          status: 'skipped',
          reason: 'No fixture ID available for testing'
        }
      }
    }

    // Teste 5: Cache performance
    if (feature === 'all' || feature === 'cache') {
      console.log(`💾 Testando performance do cache...`)
      const cacheTests = []
      
      // Teste de escrita e leitura
      const testKey = `test:${Date.now()}`
      const testData = { test: true, timestamp: new Date().toISOString() }
      
      const writeStart = Date.now()
      await cacheManager.setValidation(testKey, testData)
      const writeTime = Date.now() - writeStart
      
      const readStart = Date.now()
      const cachedData = await cacheManager.getValidation(testKey)
      const readTime = Date.now() - readStart
      
      results.results.cache = {
        status: 'success',
        write_time_ms: writeTime,
        read_time_ms: readTime,
        data_integrity: JSON.stringify(cachedData) === JSON.stringify(testData),
        cache_type: cacheManager.getCacheInfo().type,
        is_connected: cacheManager.isConnected()
      }
      
      // Limpar teste
      await cacheManager.invalidateFixtures(testKey)
    }

    // Resumo dos testes
    const summary = {
      total_tests: Object.keys(results.results).length,
      successful_tests: Object.values(results.results).filter((r: any) => r.status === 'success').length,
      failed_tests: Object.values(results.results).filter((r: any) => r.status === 'error').length,
      skipped_tests: Object.values(results.results).filter((r: any) => r.status === 'skipped').length,
      no_data_tests: Object.values(results.results).filter((r: any) => r.status === 'no_data').length
    }

    results.summary = summary
    results.recommendations = generateRecommendations(results)

    console.log(`✅ Teste concluído - ${summary.successful_tests}/${summary.total_tests} sucessos`)

    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'no-cache',
        'X-Test-Feature': feature,
        'X-Test-Date': date
      }
    })

  } catch (error: any) {
    console.error(`❌ Erro no teste das funcionalidades:`, error)
    return NextResponse.json({
      error: 'Erro durante teste das funcionalidades',
      message: error.message,
      feature_tested: feature,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

function generateRecommendations(results: any): string[] {
  const recommendations = []

  // Verificar configuração da API
  if (!results.test_info.api_status.has_api_key) {
    recommendations.push("⚠️ Configure SPORTMONKS_API_KEY no arquivo .env.local")
  }

  // Verificar cache
  if (!results.cache_status.connected) {
    recommendations.push("⚠️ Cache não conectado - configure Redis para melhor performance")
  }

  // Verificar resultados dos testes
  if (results.results.fixtures?.status === 'error') {
    recommendations.push("❌ API de fixtures com problemas - verifique credenciais e plano")
  }

  if (results.results.predictions?.status === 'no_data') {
    recommendations.push("📊 Predições não disponíveis - pode necessitar upgrade do plano SportMonks")
  }

  if (results.results.odds?.status === 'no_data') {
    recommendations.push("💰 Odds não disponíveis - verifique se o plano inclui dados de apostas")
  }

  if (results.summary.successful_tests === results.summary.total_tests) {
    recommendations.push("🎉 Todas as funcionalidades estão funcionando perfeitamente!")
  }

  return recommendations
} 