// Tipos para a listagem de próximos jogos (simplificado)
export interface UpcomingFixtureForAnalysis {
  id: number
  name: string // "Time A vs Time B"
  leagueName: string
  leagueLogo?: string
  teamALogo?: string
  teamBLogo?: string
  matchDate: string // ISO string
}

// Tipos para os detalhes da fixture da SportMonks API
interface SportMonksParticipant {
  id: number
  name: string
  image_path: string
  meta?: { location: "home" | "away" }
}

interface SportMonksLeagueInfo {
  id: number
  name: string
  image_path?: string
}

interface SportMonksVenue {
  id: number
  name: string
  city_name?: string
}

interface SportMonksGameState {
  id: number
  state: string
  name: string
}

interface SportMonksScoreDetail {
  goals: number
  participant_id: number
}

interface SportMonksScoreEntry {
  score: SportMonksScoreDetail
  description: string
}

interface SportMonksEventType {
  id: number
  name: string
  code: string
  developer_name: string
  model_type: string
  stat_group: string | null
}

interface SportMonksEventPeriod {
  id: number
  fixture_id: number
  type_id: number
  started: number | null
  ended: number | null
  counts_from: number | null
  ticking: boolean
}

interface SportMonksEventPlayer {
  id: number
  // ... outros campos do jogador
  display_name: string
  image_path: string
}

interface SportMonksEvent {
  id: number
  fixture_id: number
  period_id: number | null
  participant_id: number | null // Time que realizou o evento
  type_id: number
  // section: string; // 'event', 'substitution', 'card', 'goal'
  player_id: number | null
  related_player_id: number | null
  minute: number
  extra_minute: number | null
  // ... outros campos do evento
  type?: SportMonksEventType
  period?: SportMonksEventPeriod
  player?: SportMonksEventPlayer
  related_player?: SportMonksEventPlayer
  // Adicionar campos específicos de cada tipo de evento se necessário
  // ex: result (para gols), card_type (para cartões)
}

interface SportMonksPredictionType {
  id: number
  name: string
  code: string
}

interface SportMonksPredictionData {
  // A estrutura aqui varia muito dependendo do type_id
  // Exemplo para 1X2:
  home?: number
  draw?: number
  away?: number
  // Exemplo para Over/Under:
  over?: number
  under?: number
  total?: string // e.g., "2.5"
  // ... outros tipos
  [key: string]: any // Para flexibilidade
}

interface SportMonksPredictionEntry {
  id: number
  fixture_id: number
  type_id: number
  type?: SportMonksPredictionType
  predictions: SportMonksPredictionData // Odds do bookmaker
  fair_odds?: SportMonksPredictionData // Fair odds da SportMonks
  // ... outros campos
}

export interface DetailedFixtureAnalysis {
  id: number
  name: string
  starting_at: string
  league?: SportMonksLeagueInfo
  participants?: SportMonksParticipant[]
  venue?: SportMonksVenue
  state?: SportMonksGameState
  scores?: SportMonksScoreEntry[] // Geralmente vazio para jogos futuros
  events?: SportMonksEvent[] // Geralmente vazio para jogos futuros
  predictions?: SportMonksPredictionEntry[] // Predições da SportMonks
  // Adicionar outros campos conforme necessário
}

export interface SportMonksDetailedFixtureResponse {
  data: DetailedFixtureAnalysis
  // ... outros campos da resposta da API
}

// Removido: ForBetPrediction
