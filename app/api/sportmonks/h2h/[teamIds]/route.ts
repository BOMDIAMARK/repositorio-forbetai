import { NextResponse } from "next/server"

const SPORTMONKS_BASE_URL = process.env.SPORTMONKS_BASE_URL || "https://api.sportmonks.com/v3"
const SPORTMONKS_API_KEY = process.env.SPORTMONKS_API_KEY

interface RouteContext {
  params: {
    teamIds: string // Format: "teamA-vs-teamB" (e.g., "85-vs-86")
  }
}

export async function GET(request: Request, context: RouteContext) {
  const { teamIds } = context.params

  if (!teamIds || !teamIds.includes('-vs-')) {
    return NextResponse.json({ 
      error: "Team IDs format should be 'teamA-vs-teamB'" 
    }, { status: 400 })
  }

  if (!SPORTMONKS_API_KEY) {
    return NextResponse.json({ 
      error: "SportMonks API key not configured" 
    }, { status: 500 })
  }

  try {
    const [teamAId, teamBId] = teamIds.split('-vs-')
    
    // SportMonks H2H endpoint
    const h2hUrl = `${SPORTMONKS_BASE_URL}/football/head-to-head/${teamAId}/${teamBId}?api_token=${SPORTMONKS_API_KEY}&include=fixtures.league;fixtures.participants;fixtures.scores`
    
    console.log(`🔍 Buscando H2H: ${teamAId} vs ${teamBId}`)
    
    const response = await fetch(h2hUrl, {
      next: { revalidate: 3600 } // Cache por 1 hora
    })

    if (!response.ok) {
      console.error(`Erro SportMonks H2H: ${response.status}`)
      throw new Error(`SportMonks API error: ${response.status}`)
    }

    const rawData = await response.json()
    
    // Process the H2H data
    const processedH2H = processH2HData(rawData.data, parseInt(teamAId))
    
    return NextResponse.json({
      data: processedH2H,
      meta: {
        teamA: teamAId,
        teamB: teamBId,
        source: 'SportMonks',
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Erro ao buscar H2H:', error)
    
    // Return mock data as fallback
    const [teamAId, teamBId] = teamIds.split('-vs-')
    const mockH2H = generateMockH2H(parseInt(teamAId), parseInt(teamBId))
    
    return NextResponse.json({
      data: mockH2H,
      meta: {
        teamA: teamAId,
        teamB: teamBId,
        source: 'Mock',
        error: error.message,
        lastUpdated: new Date().toISOString()
      }
    })
  }
}

function processH2HData(fixtures: any[], teamAId: number) {
  if (!fixtures || fixtures.length === 0) {
    return generateMockH2H(teamAId, 0)
  }

  let wins = 0
  let draws = 0
  let losses = 0
  let goalsFor = 0
  let goalsAgainst = 0
  const last5Results: Array<{ result: 'W' | 'D' | 'L', score: string, date: string }> = []

  // Sort fixtures by date (most recent first)
  const sortedFixtures = fixtures.sort((a, b) => 
    new Date(b.starting_at).getTime() - new Date(a.starting_at).getTime()
  )

  for (const fixture of sortedFixtures.slice(0, 10)) { // Last 10 matches
    if (!fixture.scores || fixture.scores.length === 0) continue

    const homeParticipant = fixture.participants?.find((p: any) => p.meta?.location === 'home')
    const awayParticipant = fixture.participants?.find((p: any) => p.meta?.location === 'away')
    
    if (!homeParticipant || !awayParticipant) continue

    const isTeamAHome = homeParticipant.id === teamAId
    const homeScore = fixture.scores.find((s: any) => s.participant_id === homeParticipant.id)?.goals || 0
    const awayScore = fixture.scores.find((s: any) => s.participant_id === awayParticipant.id)?.goals || 0

    if (isTeamAHome) {
      goalsFor += homeScore
      goalsAgainst += awayScore
      
      if (homeScore > awayScore) {
        wins++
        if (last5Results.length < 5) last5Results.push({ result: 'W', score: `${homeScore}-${awayScore}`, date: fixture.starting_at })
      } else if (homeScore < awayScore) {
        losses++
        if (last5Results.length < 5) last5Results.push({ result: 'L', score: `${homeScore}-${awayScore}`, date: fixture.starting_at })
      } else {
        draws++
        if (last5Results.length < 5) last5Results.push({ result: 'D', score: `${homeScore}-${awayScore}`, date: fixture.starting_at })
      }
    } else {
      goalsFor += awayScore
      goalsAgainst += homeScore
      
      if (awayScore > homeScore) {
        wins++
        if (last5Results.length < 5) last5Results.push({ result: 'W', score: `${awayScore}-${homeScore}`, date: fixture.starting_at })
      } else if (awayScore < homeScore) {
        losses++
        if (last5Results.length < 5) last5Results.push({ result: 'L', score: `${awayScore}-${homeScore}`, date: fixture.starting_at })
      } else {
        draws++
        if (last5Results.length < 5) last5Results.push({ result: 'D', score: `${awayScore}-${homeScore}`, date: fixture.starting_at })
      }
    }
  }

  return {
    wins,
    draws,
    losses,
    goals_for: goalsFor,
    goals_against: goalsAgainst,
    last_5_results: last5Results,
    total_matches: wins + draws + losses
  }
}

function generateMockH2H(teamAId: number, teamBId: number) {
  // Generate more realistic mock data based on team IDs
  const seed = (teamAId + teamBId) % 100
  
  const wins = Math.floor(seed / 20) + 1
  const draws = Math.floor((seed % 20) / 10) + 1
  const losses = Math.floor((seed % 10) / 5) + 1

  return {
    wins,
    draws,
    losses,
    goals_for: wins * 2 + draws + Math.floor(seed / 10),
    goals_against: losses * 2 + draws + Math.floor(seed / 15),
    last_5_results: [
      { result: 'W' as const, score: '2-1', date: '2024-01-15' },
      { result: 'D' as const, score: '1-1', date: '2023-08-20' },
      { result: 'W' as const, score: '3-0', date: '2023-03-10' },
      { result: 'L' as const, score: '0-2', date: '2022-11-05' },
      { result: 'W' as const, score: '2-1', date: '2022-07-18' }
    ],
    total_matches: wins + draws + losses
  }
} 