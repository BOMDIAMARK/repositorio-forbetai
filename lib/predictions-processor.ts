import { ProcessedOdds } from './odds-mapper'

export interface PredictionData {
  fullTimeResult?: {
    home: { probability: number; description: string }
    draw: { probability: number; description: string }
    away: { probability: number; description: string }
  }
  bothTeamsToScore?: {
    yes: { probability: number; description: string }
    no: { probability: number; description: string }
  }
  totalGoals?: {
    over25: { probability: number; description: string }
    under25: { probability: number; description: string }
    over15: { probability: number; description: string }
    under15: { probability: number; description: string }
  }
  correctScore?: Array<{
    score: string
    probability: number
    description: string
  }>
}

// Converte odds em probabilidades implícitas
function oddsToProbability(odds: number): number {
  if (odds === 0) return 0
  return Math.round((1 / odds) * 100 * 100) / 100 // Arredonda para 2 casas decimais
}

// Determina a descrição baseada na probabilidade
function getProbabilityDescription(probability: number): string {
  if (probability >= 70) return 'Muito Provável'
  if (probability >= 55) return 'Provável'
  if (probability >= 40) return 'Equilibrado'
  if (probability >= 25) return 'Improvável'
  return 'Muito Improvável'
}

// Processa odds em formato de predições intuitivas
export function processPredictions(processedOdds?: ProcessedOdds): PredictionData {
  const predictions: PredictionData = {}

  // Resultado Final
  if (processedOdds?.fullTimeResult) {
    const homeProbability = oddsToProbability(processedOdds.fullTimeResult.home)
    const drawProbability = oddsToProbability(processedOdds.fullTimeResult.draw)
    const awayProbability = oddsToProbability(processedOdds.fullTimeResult.away)

    predictions.fullTimeResult = {
      home: {
        probability: homeProbability,
        description: getProbabilityDescription(homeProbability)
      },
      draw: {
        probability: drawProbability,
        description: getProbabilityDescription(drawProbability)
      },
      away: {
        probability: awayProbability,
        description: getProbabilityDescription(awayProbability)
      }
    }
  }

  // Ambas Marcam
  if (processedOdds?.bothTeamsToScore) {
    const yesProbability = oddsToProbability(processedOdds.bothTeamsToScore.yes)
    const noProbability = oddsToProbability(processedOdds.bothTeamsToScore.no)

    predictions.bothTeamsToScore = {
      yes: {
        probability: yesProbability,
        description: getProbabilityDescription(yesProbability)
      },
      no: {
        probability: noProbability,
        description: getProbabilityDescription(noProbability)
      }
    }
  }

  // Total de Gols
  if (processedOdds?.totalGoals) {
    predictions.totalGoals = {
      over25: {
        probability: oddsToProbability(processedOdds.totalGoals.over25),
        description: getProbabilityDescription(oddsToProbability(processedOdds.totalGoals.over25))
      },
      under25: {
        probability: oddsToProbability(processedOdds.totalGoals.under25),
        description: getProbabilityDescription(oddsToProbability(processedOdds.totalGoals.under25))
      },
      over15: {
        probability: oddsToProbability(processedOdds.totalGoals.over15),
        description: getProbabilityDescription(oddsToProbability(processedOdds.totalGoals.over15))
      },
      under15: {
        probability: oddsToProbability(processedOdds.totalGoals.under15),
        description: getProbabilityDescription(oddsToProbability(processedOdds.totalGoals.under15))
      }
    }
  }

  // Placar Correto
  if (processedOdds?.correctScore) {
    predictions.correctScore = processedOdds.correctScore.map(score => ({
      score: score.score,
      probability: oddsToProbability(score.odd),
      description: getProbabilityDescription(oddsToProbability(score.odd))
    }))
  }

  return predictions
}

// Função para determinar cor baseada na probabilidade
export function getProbabilityColor(probability: number): string {
  if (probability >= 70) return 'text-green-400'
  if (probability >= 55) return 'text-green-300'
  if (probability >= 40) return 'text-yellow-400'
  if (probability >= 25) return 'text-orange-400'
  return 'text-red-400'
}

// Função para ícone baseado na probabilidade
export function getProbabilityIcon(probability: number): string {
  if (probability >= 70) return '🔥'
  if (probability >= 55) return '✅'
  if (probability >= 40) return '⚖️'
  if (probability >= 25) return '❓'
  return '❌'
} 