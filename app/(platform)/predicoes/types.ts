export interface Prediction {
  id: string
  teamA: { name: string; logoUrl?: string; shortName?: string }
  teamB: { name: string; logoUrl?: string; shortName?: string }
  league: { name: string; countryFlagUrl?: string }
  matchDate: string // ISO string
  confidence: number // Confiança geral da IA para o conjunto de predições

  // Predições detalhadas
  result: {
    home: number // porcentagem
    draw: number // porcentagem
    away: number // porcentagem
  }
  goals: {
    prediction: string // ex: "Mais de 2.5"
    odds: number
  }
  corners: {
    prediction: string // ex: "Menos de 10.5"
    odds: number
  }
  cards: {
    prediction: string // ex: "Mais de 4.5"
    odds: number
  }

  // Para o modal "Análise" - NOVA ESTRUTURA DETALHADA
  analysis: FullMatchAnalysis // Referência à nova estrutura abaixo

  // Para o modal "Detalhes" (dados para gráficos)
  probabilities_over_time: {
    home: { time: number; value: number }[]
    draw: { time: number; value: number }[]
    away: { time: number; value: number }[]
  }
}

// Manter tipos de Liga e Time
export interface League {
  id: string
  name: string
}

export interface Team {
  id: string
  name: string
}

// NOVA ESTRUTURA PARA ANÁLISE DETALHADA DA PARTIDA
interface TeamAnalysisDetail {
  profileTitle: string // e.g., "Inter Miami CF - Ataque Explosivo:"
  stats: string[] // e.g., ["2,3 gols marcados por jogo (últimos 10 jogos)"]
  keyPlayers?: { name: string; details: string }[]
}

interface StatisticalAnalysisSection {
  offensiveTeamA: TeamAnalysisDetail
  offensiveTeamB: TeamAnalysisDetail
  defensiveTeamA: TeamAnalysisDetail
  defensiveTeamB: TeamAnalysisDetail
  corners: {
    teamAAvg: string
    teamBAvg: string
    totalExpected: string
  }
  discipline: {
    notes: string[]
    referee?: string
  }
}

interface DataDrivenBet {
  title: string // e.g., "TOTAL DE GOLS"
  prediction: string // e.g., "MAIS DE 2.5 GOLS"
  probability?: string
  justification: string
}

interface ProbableScorer {
  team: "TeamA" | "TeamB"
  players: { name: string; chance: string; details: string }[]
}

interface KeyMoment {
  moment: string // e.g., "Primeiro gol"
  description: string // e.g., "Primeiros 20 minutos (Inter Miami costuma marcar cedo)"
}

interface DecisiveFactor {
  teamName: string
  advantages: string[]
}

interface ProbableScenario {
  titleWithProbability: string // e.g., "🔥 CENÁRIO 1 (40%): PALMEIRAS VENCE 2-1"
  details: string[]
}

interface BettingRecommendationCategory {
  title: string // e.g., "🏆 APOSTAS PRINCIPAIS (ALTA CONFIANÇA)"
  recommendations: {
    name: string
    oddsExample: string
  }[]
}

export interface FullMatchAnalysis {
  matchTitle: string // e.g., "INTER MIAMI CF vs PALMEIRAS"
  competitionDetails: string // e.g., "Copa do Mundo de Clubes FIFA 2025 - 23/06/2025"
  executiveSummary: string
  statisticalAnalysis: StatisticalAnalysisSection
  dataDrivenBets: {
    totalGoals: DataDrivenBet
    mostLikelyResult: DataDrivenBet
    // Adicionar outros palpites como scorers, corners, cards aqui se necessário
    // Para simplificar, focaremos em Gols e Resultado por enquanto
  }
  probableScorers?: ProbableScorer[] // Opcional para manter o exemplo conciso
  cornersPrediction?: DataDrivenBet
  cardsPrediction?: DataDrivenBet
  keyMoments?: KeyMoment[]
  decisiveFactors: {
    teamA: DecisiveFactor
    teamB: DecisiveFactor
  }
  probableScenarios: ProbableScenario[]
  bettingRecommendations: BettingRecommendationCategory[]
  conclusion: string
}
