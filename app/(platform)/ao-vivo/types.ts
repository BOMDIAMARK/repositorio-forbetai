// Tipos baseados na estrutura esperada da API SportMonks para livescores
// Estes tipos podem precisar de ajustes conforme a resposta real da API

interface SportMonksTeam {
  id: number
  name: string
  image_path: string
  meta?: { location: "home" | "away" }
}

interface SportMonksScoreInfo {
  goals: number
  participant_id: number
}

interface SportMonksScore {
  score: SportMonksScoreInfo
  description: string // e.g., "CURRENT", "HT"
  type_id?: number // Para identificar o tipo de score (ex: current, ht)
}

interface SportMonksLeague {
  id: number
  name: string
  image_path: string
}

interface SportMonksState {
  id: number
  state: string // e.g., "LIVE", "HT", "FT"
  name: string // e.g., "In Progress", "Half-Time", "Finished"
  short_name: string // e.g., "LIVE", "HT"
  developer_name: string
}

interface SportMonksPeriod {
  type_id: number // e.g., 1 (1st half), 2 (2nd half), 10 (Penalties)
  started: number | null // timestamp
  ended: number | null // timestamp
  minutes?: number // Duração do período
  seconds?: number
  counts_from?: number // De onde o tempo começa a contar (ex: 45 para o segundo tempo)
  ticking?: boolean // Se o tempo está correndo
}

export interface LiveScoreFixture {
  id: number
  name: string // Ex: "Team A vs Team B"
  league_id: number
  season_id: number
  stage_id: number
  state_id: number
  starting_at: string // ISO datetime string
  result_info: string | null
  league?: SportMonksLeague // Included
  participants?: SportMonksTeam[] // Included
  scores?: SportMonksScore[] // Included
  state?: SportMonksState // Included
  periods?: SportMonksPeriod[] // Included
  // Adicionar outros campos conforme necessário
}

export interface SportMonksApiResponse {
  data: LiveScoreFixture[]
  pagination?: {
    count: number
    per_page: number
    current_page: number
    next_page: string | null
    has_more: boolean
  }
  subscription?: any[]
  rate_limit?: any
  timezone?: string
}
