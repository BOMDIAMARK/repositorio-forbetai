import { NextResponse } from "next/server"

const SPORTMONKS_BASE_URL = process.env.SPORTMONKS_BASE_URL || "https://api.sportmonks.com/v3"
const SPORTMONKS_API_KEY = process.env.SPORTMONKS_API_KEY

interface RouteContext {
  params: {
    teamId: string
  }
}

export async function GET(request: Request, context: RouteContext) {
  const { teamId } = context.params

  if (!teamId) {
    return NextResponse.json({ 
      error: "Team ID is required" 
    }, { status: 400 })
  }

  if (!SPORTMONKS_API_KEY) {
    return NextResponse.json({ 
      error: "SportMonks API key not configured" 
    }, { status: 500 })
  }

  try {
    // Get current season to filter recent matches
    const currentDate = new Date()
    const seasonStart = new Date(currentDate.getFullYear() - (currentDate.getMonth() < 6 ? 1 : 0), 6, 1) // July 1st
    
    // SportMonks team fixtures endpoint for recent matches
    const teamFixturesUrl = `${SPORTMONKS_BASE_URL}/football/fixtures/by-team-and-season?api_token=${SPORTMONKS_API_KEY}&team_id=${teamId}&season_id=current&include=league,participants,scores,state&sort=-starting_at&limit=10`
    
    console.log(`📊 Buscando forma recente do time: ${teamId}`)
    
    const response = await fetch(teamFixturesUrl, {
      next: { revalidate: 1800 } // Cache por 30 minutos
    })

    if (!response.ok) {
      console.error(`Erro SportMonks Team Form: ${response.status}`)
      throw new Error(`SportMonks API error: ${response.status}`)
    }

    const rawData = await response.json()
    
    // Process the team form data
    const processedForm = processTeamFormData(rawData.data, parseInt(teamId))
    
    return NextResponse.json({
      data: processedForm,
      meta: {
        teamId,
        source: 'SportMonks',
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Erro ao buscar forma do time:', error)
    
    // Return mock data as fallback
    const mockForm = generateMockTeamForm(parseInt(teamId))
    
    return NextResponse.json({
      data: mockForm,
      meta: {
        teamId,
        source: 'Mock',
        error: error.message,
        lastUpdated: new Date().toISOString()
      }
    })
  }
}

function processTeamFormData(fixtures: any[], teamId: number) {
  if (!fixtures || fixtures.length === 0) {
    return generateMockTeamForm(teamId)
  }

  let wins = 0
  let draws = 0
  let losses = 0
  let goalsFor = 0
  let goalsAgainst = 0
  const last5Matches: Array<{
    result: 'W' | 'D' | 'L'
    opponent: string
    score: string
    date: string
  }> = []

  // Filter only finished matches and sort by date (most recent first)
  const finishedFixtures = fixtures
    .filter(fixture => fixture.state?.name === 'Finished' || fixture.state?.name === 'FT')
    .sort((a, b) => new Date(b.starting_at).getTime() - new Date(a.starting_at).getTime())

  for (const fixture of finishedFixtures.slice(0, 10)) { // Last 10 finished matches
    if (!fixture.scores || fixture.scores.length === 0) continue

    const homeParticipant = fixture.participants?.find((p: any) => p.meta?.location === 'home')
    const awayParticipant = fixture.participants?.find((p: any) => p.meta?.location === 'away')
    
    if (!homeParticipant || !awayParticipant) continue

    const isTeamHome = homeParticipant.id === teamId
    const opponent = isTeamHome ? awayParticipant : homeParticipant
    
    const homeScore = fixture.scores.find((s: any) => s.participant_id === homeParticipant.id)?.goals || 0
    const awayScore = fixture.scores.find((s: any) => s.participant_id === awayParticipant.id)?.goals || 0

    let result: 'W' | 'D' | 'L'
    let teamScore, opponentScore

    if (isTeamHome) {
      teamScore = homeScore
      opponentScore = awayScore
      goalsFor += homeScore
      goalsAgainst += awayScore
      
      if (homeScore > awayScore) {
        wins++
        result = 'W'
      } else if (homeScore < awayScore) {
        losses++
        result = 'L'
      } else {
        draws++
        result = 'D'
      }
    } else {
      teamScore = awayScore
      opponentScore = homeScore
      goalsFor += awayScore
      goalsAgainst += homeScore
      
      if (awayScore > homeScore) {
        wins++
        result = 'W'
      } else if (awayScore < homeScore) {
        losses++
        result = 'L'
      } else {
        draws++
        result = 'D'
      }
    }

    if (last5Matches.length < 5) {
      last5Matches.push({
        result,
        opponent: opponent.name || 'Adversário',
        score: `${teamScore}-${opponentScore}`,
        date: fixture.starting_at
      })
    }
  }

  return {
    last_5_matches: last5Matches,
    wins,
    draws,
    losses,
    goals_for: goalsFor,
    goals_against: goalsAgainst,
    total_matches: wins + draws + losses,
    form_percentage: Math.round(((wins * 3 + draws) / ((wins + draws + losses) * 3)) * 100)
  }
}

function generateMockTeamForm(teamId: number) {
  // Generate more realistic mock data based on team ID
  const seed = teamId % 100
  
  const wins = Math.floor(seed / 25) + 1 // 1-4 wins
  const draws = Math.floor((seed % 25) / 12) + 1 // 0-2 draws  
  const losses = 5 - wins - draws // Remaining to make 5 total

  const opponents = ['Barcelona', 'Real Madrid', 'Atletico', 'Valencia', 'Sevilla']
  const mockMatches = []
  
  for (let i = 0; i < 5; i++) {
    let result: 'W' | 'D' | 'L'
    if (i < wins) result = 'W'
    else if (i < wins + draws) result = 'D'
    else result = 'L'
    
    const teamScore = result === 'W' ? Math.floor(Math.random() * 3) + 1 : 
                     result === 'D' ? Math.floor(Math.random() * 2) + 1 : 
                     Math.floor(Math.random() * 2)
    const opponentScore = result === 'L' ? teamScore + Math.floor(Math.random() * 2) + 1 :
                         result === 'D' ? teamScore :
                         Math.floor(Math.random() * teamScore)

    mockMatches.push({
      result,
      opponent: opponents[i] || `Time ${i + 1}`,
      score: `${teamScore}-${opponentScore}`,
      date: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  return {
    last_5_matches: mockMatches,
    wins,
    draws,
    losses,
    goals_for: wins * 2 + draws + Math.floor(seed / 20),
    goals_against: losses * 2 + draws + Math.floor(seed / 30),
    total_matches: 5,
    form_percentage: Math.round(((wins * 3 + draws) / 15) * 100)
  }
} 