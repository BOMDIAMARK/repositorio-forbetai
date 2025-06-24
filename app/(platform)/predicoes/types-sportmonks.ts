interface SportMonksTeamInfo {
  id: number
  name: string
  image_path?: string
  // Add other team properties if needed
}

interface SportMonksParticipant {
  id: number
  sport_id: number
  country_id: number
  venue_id?: number
  gender: string
  name: string
  short_code?: string
  image_path?: string
  founded?: number
  type?: string
  placeholder: boolean
  last_played_at?: string
  meta?: { location: "home" | "away" } // Added based on live scores example
}

interface SportMonksOdd {
  id: number
  fixture_id: number
  market_id: number
  bookmaker_id: number
  label: string // e.g., "1", "X", "2"
  value: string // e.g., "1.85"
  winning: boolean | null
  stopped: boolean
  total?: string | null // For Over/Under markets
  handicap?: string | null // For Handicap markets
  // ... other odd properties
}

interface SportMonksBookmakerOdds {
  id: number
  // ... other bookmaker props
  odds: {
    data: SportMonksOdd[]
  }
}

interface SportMonksOddsData {
  id: number
  // ... other odds top-level props
  bookmaker?: {
    data: SportMonksBookmakerOdds[]
  }
}

interface SportMonksPredictionData {
  id: number
  fixture_id: number
  type_id: number // Market type ID
  // Example probabilities, adjust based on actual API response for predictions include
  probability_home_team_winner?: string // SportMonks often returns probabilities as strings
  probability_draw?: string
  probability_away_team_winner?: string
  probability_over_2_5_goals?: string
  probability_under_2_5_goals?: string
  // ... other prediction values
  predictions?: {
    // This is often where the actual values are
    true?: number // e.g. for "Both Teams to Score - Yes"
    false?: number
    home?: number // For 1X2
    draw?: number
    away?: number
    over?: string // For Over/Under
    under?: string
    total?: string // e.g. "2.5"
  }
  type?: {
    // Included prediction type details
    id: number
    name: string // e.g. "Match Odds", "Over/Under"
    code: string
  }
}

interface SportMonksLeague {
  id: number
  name: string
  image_path?: string
  // ... other league properties
}

interface SportMonksScore {
  id: number
  fixture_id: number
  type_id: number // e.g. current, ht, ft
  participant_id: number
  score: {
    goals: number
    participant_id: number // Redundant but often present
  }
  description: string // e.g. "CURRENT", "HT"
  // ... other score properties
}

interface SportMonksPeriod {
  id: number
  fixture_id: number
  type_id: number // e.g. 1 (1st half), 2 (2nd half)
  started?: number // timestamp
  ended?: number // timestamp
  counts_from?: number
  ticking?: boolean
  // ... other period properties
}

interface SportMonksStatistic {
  id: number
  fixture_id: number
  type_id: number // Stat type ID (e.g., goals, corners, cards)
  participant_id: number // Team ID
  data: {
    value: number | string | null // Value of the statistic
  }
  location: "home" | "away" | "total"
  type?: {
    // Included statistic type details
    id: number
    name: string // e.g. "Goals", "Corners"
    code: string
    category_id: number
  }
  // ... other statistic properties
}

// For the list of fixtures by date
export interface SportMonksFixture {
  id: number
  league_id: number
  season_id: number
  stage_id: number
  name: string // e.g., "Team A vs Team B"
  starting_at: string // ISO datetime string
  result_info?: string | null
  leg?: string
  details?: any | null
  length?: number
  placeholder?: boolean
  state_id?: number
  // Included data
  league?: { data: SportMonksLeague } // API wraps includes in 'data'
  participants?: SportMonksParticipant[] // Changed from teams to participants
  scores?: { data: SportMonksScore[] }
  odds?: { data: SportMonksOddsData[] }
  predictions?: { data: SportMonksPredictionData[] } // For general predictions
  statistics?: { data: SportMonksStatistic[] } // For summary stats if included in list
}

// For detailed fixture information
export interface SportMonksFixtureDetails extends SportMonksFixture {
  // statistics might be more detailed here or structured differently
  // periods might be included
  periods?: { data: SportMonksPeriod[] }
  // State information
  state?: {
    id: number
    state: string
    name: string
    short_name: string
    developer_name: string
  }
  // Ensure all fields from fetchFixtureDetails include are covered
}
