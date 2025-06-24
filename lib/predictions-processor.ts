

export interface PredictionEntry {
  probability: number
  description: string
}

export interface PredictionData {
  fullTimeResult?: {
    home: PredictionEntry
    draw: PredictionEntry
    away: PredictionEntry
  }
  bothTeamsToScore?: {
    yes: PredictionEntry
    no: PredictionEntry
  }
  totalGoals?: {
    over25: PredictionEntry
    under25: PredictionEntry
    over15: PredictionEntry
    under15: PredictionEntry
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

// Determina a descrição baseada na probabilidade (já em português)
function getProbabilityDescription(probability: number): string {
  if (probability >= 70) return 'Muito Provável'
  if (probability >= 55) return 'Provável'
  if (probability >= 40) return 'Equilibrado'
  if (probability >= 25) return 'Improvável'
  return 'Muito Improvável'
}

// Processa odds em formato de predições intuitivas
export function processPredictions(processedOdds?: Record<string, unknown>): PredictionData {
  const predictions: PredictionData = {}

  if (!processedOdds) return predictions

  // Resultado Final
  const fullTimeResult = processedOdds.fullTimeResult as Record<string, number>
  if (fullTimeResult) {
    const homeProbability = oddsToProbability(fullTimeResult.home)
    const drawProbability = oddsToProbability(fullTimeResult.draw)
    const awayProbability = oddsToProbability(fullTimeResult.away)

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
  const bothTeamsToScore = processedOdds.bothTeamsToScore as Record<string, number>
  if (bothTeamsToScore) {
    const yesProbability = oddsToProbability(bothTeamsToScore.yes)
    const noProbability = oddsToProbability(bothTeamsToScore.no)

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
  const totalGoals = processedOdds.totalGoals as Record<string, number>
  if (totalGoals) {
    predictions.totalGoals = {
      over25: {
        probability: oddsToProbability(totalGoals.over25),
        description: getProbabilityDescription(oddsToProbability(totalGoals.over25))
      },
      under25: {
        probability: oddsToProbability(totalGoals.under25),
        description: getProbabilityDescription(oddsToProbability(totalGoals.under25))
      },
      over15: {
        probability: oddsToProbability(totalGoals.over15),
        description: getProbabilityDescription(oddsToProbability(totalGoals.over15))
      },
      under15: {
        probability: oddsToProbability(totalGoals.under15),
        description: getProbabilityDescription(oddsToProbability(totalGoals.under15))
      }
    }
  }

  // Placar Correto
  const correctScore = processedOdds.correctScore as Array<{ score: string; odd: number }>
  if (correctScore && Array.isArray(correctScore)) {
    predictions.correctScore = correctScore.map(score => ({
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