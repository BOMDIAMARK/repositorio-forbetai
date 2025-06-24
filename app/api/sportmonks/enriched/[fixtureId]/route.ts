import { NextResponse } from "next/server"
import { fetchFixtureEnrichedData, fetchTeamLogos } from "@/lib/sportmonks-api-client"
import { cacheManager } from "@/lib/redis-cache"

interface RouteContext {
  params: {
    fixtureId: string
  }
}

export async function GET(request: Request, context: RouteContext) {
  const { fixtureId } = context.params

  console.log(`🏆 API Route chamada para dados enriquecidos da fixture: ${fixtureId}`)

  if (!fixtureId || isNaN(Number(fixtureId))) {
    console.error(`❌ Fixture ID inválido para dados enriquecidos: ${fixtureId}`)
    return NextResponse.json({ error: "Fixture ID inválido." }, { status: 400 })
  }

  try {
    // Verificar cache primeiro (TTL mais longo para dados enriquecidos)
    const cacheKey = `enriched:fixture:${fixtureId}`
    const cachedData = await cacheManager.getFixtures(cacheKey)
    
    if (cachedData) {
      console.log(`📋 Cache hit para dados enriquecidos da fixture ${fixtureId}`)
      return NextResponse.json({
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      })
    }

    // Buscar dados enriquecidos da SportMonks
    console.log(`🚀 Buscando dados enriquecidos da SportMonks para fixture: ${fixtureId}`)
    const enrichedData = await fetchFixtureEnrichedData(Number(fixtureId))
    
    if (!enrichedData) {
      console.warn(`⚠️ Dados enriquecidos não encontrados para fixture: ${fixtureId}`)
      return NextResponse.json({ 
        error: "Dados enriquecidos não encontrados para esta partida.",
        note: "Dados podem não estar disponíveis para partidas muito antigas ou canceladas."
      }, { status: 404 })
    }

    // Buscar logos dos times se participantes estiverem disponíveis
    let teamLogos: any[] = []
    if (enrichedData.participants && enrichedData.participants.length > 0) {
      const teamIds = enrichedData.participants.map((p: any) => p.id).filter((id: any) => id)
      if (teamIds.length > 0) {
        teamLogos = await fetchTeamLogos(teamIds)
      }
    }

    // Processar dados para formato enriquecido
    const processedData = {
      fixture_info: {
        id: enrichedData.id,
        name: enrichedData.name,
        starting_at: enrichedData.starting_at,
        result_info: enrichedData.result_info,
        aggregate_id: enrichedData.aggregate_id,
        state: {
          id: enrichedData.state?.id,
          name: enrichedData.state?.name,
          short_name: enrichedData.state?.short_name,
          developer_name: enrichedData.state?.developer_name
        }
      },
      competition: {
        league: {
          id: enrichedData.league?.id,
          name: enrichedData.league?.name,
          short_code: enrichedData.league?.short_code,
          logo: enrichedData.league?.logo,
          type: enrichedData.league?.type
        },
        season: {
          id: enrichedData.season?.id,
          name: enrichedData.season?.name,
          is_current: enrichedData.season?.is_current
        },
        round: enrichedData.round ? {
          id: enrichedData.round.id,
          name: enrichedData.round.name,
          finished: enrichedData.round.finished
        } : null,
        stage: enrichedData.stage ? {
          id: enrichedData.stage.id,
          name: enrichedData.stage.name,
          type: enrichedData.stage.type
        } : null
      },
      teams: enrichedData.participants ? enrichedData.participants.map((participant: any) => {
        const teamLogo = teamLogos.find(team => team.id === participant.id)
        return {
          id: participant.id,
          name: participant.name,
          short_code: participant.short_code,
          logo: teamLogo?.logo || participant.logo,
          founded: teamLogo?.founded,
          venue_id: teamLogo?.venue_id,
          country: teamLogo?.country,
          meta: {
            location: participant.meta?.location,
            position: participant.meta?.position
          }
        }
      }) : [],
      venue: enrichedData.venue ? {
        id: enrichedData.venue.id,
        name: enrichedData.venue.name,
        city: enrichedData.venue.city,
        capacity: enrichedData.venue.capacity,
        image: enrichedData.venue.image,
        coordinates: enrichedData.venue.coordinates
      } : null,
      scores: enrichedData.scores ? enrichedData.scores.map((score: any) => ({
        id: score.id,
        fixture_id: score.fixture_id,
        type_id: score.type_id,
        participant_id: score.participant_id,
        score: {
          goals: score.score?.goals,
          participant: score.score?.participant
        },
        description: score.description
      })) : [],
      statistics: enrichedData.statistics ? processStatistics(enrichedData.statistics) : [],
      lineups: enrichedData.lineups ? enrichedData.lineups.map((lineup: any) => ({
        participant_id: lineup.participant_id,
        formation: lineup.formation,
        players: lineup.players ? lineup.players.map((player: any) => ({
          player_id: player.player_id,
          player_name: player.player_name,
          jersey_number: player.jersey_number,
          position: player.position,
          formation_position: player.formation_position
        })) : []
      })) : [],
      periods: enrichedData.periods ? enrichedData.periods.map((period: any) => ({
        id: period.id,
        fixture_id: period.fixture_id,
        type_id: period.type_id,
        started: period.started,
        ended: period.ended,
        counts_from: period.counts_from,
        ticking: period.ticking,
        sort_order: period.sort_order,
        description: period.description,
        time_added: period.time_added,
        period_length: period.period_length,
        minutes: period.minutes,
        seconds: period.seconds
      })) : [],
      data_quality: {
        completeness_score: calculateCompletenessScore(enrichedData),
        data_sources: ['SportMonks Professional API'],
        includes: [
          'participants', 'league', 'season', 'round', 'stage', 
          'venue', 'statistics', 'lineups', 'scores', 'state', 'periods'
        ],
        enrichment_level: 'premium',
        last_updated: new Date().toISOString()
      }
    }

    // Cache por 1 hora (dados enriquecidos são mais estáveis)
    await cacheManager.setFixtures(cacheKey, processedData)
    
    console.log(`✅ Dados enriquecidos processados para fixture ${fixtureId}`)
    
    return NextResponse.json({
      data: processedData,
      cached: false,
      timestamp: new Date().toISOString(),
      performance: {
        api_calls: teamIds.length + 1,
        data_points: countDataPoints(processedData),
        enrichment_level: 'premium'
      }
    })
    
  } catch (error: any) {
    console.error(`❌ Erro ao buscar dados enriquecidos para fixture ${fixtureId}:`, {
      message: error.message,
      stack: error.stack
    })
    
    return NextResponse.json({ 
      error: error.message || "Erro ao buscar dados enriquecidos da partida.",
      debug: {
        fixtureId,
        hasApiKey: !!process.env.SPORTMONKS_API_KEY,
        baseUrl: process.env.SPORTMONKS_BASE_URL
      }
    }, { status: 500 })
  }
}

function processStatistics(statistics: any[]) {
  const processedStats = statistics.map((stat: any) => ({
    id: stat.id,
    fixture_id: stat.fixture_id,
    type_id: stat.type_id,
    participant_id: stat.participant_id,
    data: stat.data,
    type_name: getStatisticTypeName(stat.type_id),
    display_name: getStatisticDisplayName(stat.type_id)
  }))

  // Agrupar estatísticas por time
  const statsByTeam = processedStats.reduce((acc: any, stat: any) => {
    if (!acc[stat.participant_id]) {
      acc[stat.participant_id] = []
    }
    acc[stat.participant_id].push(stat)
    return acc
  }, {})

  return {
    raw_statistics: processedStats,
    by_team: statsByTeam,
    summary: generateStatisticsSummary(processedStats)
  }
}

function getStatisticTypeName(typeId: number): string {
  const typeMap: Record<number, string> = {
    1: 'Goals',
    2: 'Yellow Cards',
    3: 'Red Cards',
    4: 'Substitutions',
    5: 'Free Kicks',
    6: 'Goal Kicks',
    7: 'Throw Ins',
    8: 'Foul',
    9: 'Offside',
    10: 'Corners',
    11: 'Shots',
    12: 'Shots on Goal',
    13: 'Shots off Goal',
    14: 'Shots inside box',
    15: 'Shots outside box',
    16: 'Fouls',
    17: 'Ball Possession'
  }
  return typeMap[typeId] || `Unknown (${typeId})`
}

function getStatisticDisplayName(typeId: number): string {
  const displayMap: Record<number, string> = {
    1: 'Gols',
    2: 'Cartões Amarelos',
    3: 'Cartões Vermelhos',
    4: 'Substituições',
    5: 'Faltas Sofridas',
    6: 'Tiros de Meta',
    7: 'Laterais',
    8: 'Faltas Cometidas',
    9: 'Impedimentos',
    10: 'Escanteios',
    11: 'Finalizações',
    12: 'Chutes no Gol',
    13: 'Chutes para Fora',
    14: 'Chutes na Área',
    15: 'Chutes Fora da Área',
    16: 'Faltas',
    17: 'Posse de Bola'
  }
  return displayMap[typeId] || `Desconhecido (${typeId})`
}

function generateStatisticsSummary(statistics: any[]) {
  const summary = {
    total_statistics: statistics.length,
    categories: [] as string[],
    teams_with_data: new Set<number>()
  }

  statistics.forEach(stat => {
    summary.categories.push(stat.type_name)
    summary.teams_with_data.add(stat.participant_id)
  })

  return {
    ...summary,
    unique_categories: Array.from(new Set(summary.categories)),
    teams_count: summary.teams_with_data.size
  }
}

function calculateCompletenessScore(data: any): number {
  let score = 0
  const maxScore = 10

  // Base score para dados básicos
  if (data.id && data.name && data.starting_at) score += 1

  // Score para participantes
  if (data.participants && data.participants.length === 2) score += 1

  // Score para liga e competição
  if (data.league && data.season) score += 1

  // Score para venue
  if (data.venue) score += 1

  // Score para estado da partida
  if (data.state) score += 1

  // Score para scores
  if (data.scores && data.scores.length > 0) score += 1

  // Score para estatísticas
  if (data.statistics && data.statistics.length > 0) score += 1

  // Score para lineups
  if (data.lineups && data.lineups.length > 0) score += 1

  // Score para períodos
  if (data.periods && data.periods.length > 0) score += 1

  // Score para dados de time completos
  if (data.participants && data.participants.every((p: any) => p.logo)) score += 1

  return (score / maxScore) * 100
}

function countDataPoints(data: any): number {
  let count = 0
  
  function countRecursive(obj: any): void {
    if (Array.isArray(obj)) {
      count += obj.length
      obj.forEach(countRecursive)
    } else if (obj && typeof obj === 'object') {
      count += Object.keys(obj).length
      Object.values(obj).forEach(countRecursive)
    } else if (obj !== null && obj !== undefined) {
      count += 1
    }
  }
  
  countRecursive(data)
  return count
} 