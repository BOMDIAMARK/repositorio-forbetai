// Mapeamento dos tipos de estatísticas da SportMonks para português
export const STATISTIC_TYPES_MAP: Record<number, string> = {
  // Gols e Finalizações
  52: "Gols",
  86: "Finalizações",
  87: "Finalizações no Alvo", 
  88: "Finalizações Fora do Alvo",
  
  // Posse de Bola
  79: "Posse de Bola (%)",
  
  // Escanteios e Faltas
  7: "Escanteios",
  8: "Faltas",
  
  // Cartões
  84: "Cartões Amarelos",
  85: "Cartões Vermelhos",
  
  // Passes
  81: "Passes Totais",
  155: "Passes Certos",
  156: "Passes Errados",
  
  // Defesa
  45: "Defesas do Goleiro",
  46: "Defesas Difíceis",
  
  // Outros
  83: "Impedimentos",
  // Adicione mais conforme necessário
}

// Interface para estatística processada
export interface ProcessedStatistic {
  name: string
  homeValue: string | number
  awayValue: string | number
  typeId: number
}

// Função para processar estatísticas da SportMonks
export function processStatistics(statistics: any[], participants: any[]): ProcessedStatistic[] {
  if (!statistics || !Array.isArray(statistics) || !participants || participants.length < 2) {
    return []
  }

  // Identificar time da casa e visitante
  const homeTeam = participants.find((p: any) => p.meta?.location === "home")
  const awayTeam = participants.find((p: any) => p.meta?.location === "away")

  if (!homeTeam || !awayTeam) {
    return []
  }

  // Agrupar estatísticas por type_id
  const statsGrouped: Record<number, { home?: any, away?: any }> = {}

  statistics.forEach((stat: any) => {
    const typeId = stat.type_id
    
    if (!statsGrouped[typeId]) {
      statsGrouped[typeId] = {}
    }

    if (stat.participant_id === homeTeam.id) {
      statsGrouped[typeId].home = stat
    } else if (stat.participant_id === awayTeam.id) {
      statsGrouped[typeId].away = stat
    }
  })

  // Processar estatísticas agrupadas
  const processedStats: ProcessedStatistic[] = []

  Object.entries(statsGrouped).forEach(([typeIdStr, stats]) => {
    const typeId = parseInt(typeIdStr)
    const name = STATISTIC_TYPES_MAP[typeId] || `Estatística ${typeId}`

    if (stats.home && stats.away) {
      let homeValue = stats.home.data?.value ?? "-"
      let awayValue = stats.away.data?.value ?? "-"

      // Formatação especial para certas estatísticas
      if (typeId === 79) { // Posse de bola
        homeValue = homeValue !== "-" ? `${homeValue}%` : "-"
        awayValue = awayValue !== "-" ? `${awayValue}%` : "-"
      }

      processedStats.push({
        name,
        homeValue,
        awayValue,
        typeId
      })
    }
  })

  // Ordenar por relevância (gols primeiro, depois finalizações, etc.)
  const priority = [52, 86, 87, 79, 7, 84, 85] // Gols, Finalizações, etc.
  
  return processedStats.sort((a, b) => {
    const aPriority = priority.indexOf(a.typeId)
    const bPriority = priority.indexOf(b.typeId)
    
    if (aPriority !== -1 && bPriority !== -1) {
      return aPriority - bPriority
    }
    if (aPriority !== -1) return -1
    if (bPriority !== -1) return 1
    
    return a.name.localeCompare(b.name)
  })
}

// Função para processar scores
export function processScores(scores: any[]): { home: number, away: number } {
  if (!scores || !Array.isArray(scores)) {
    return { home: 0, away: 0 }
  }

  // Buscar o score atual (type_id = 1 geralmente é o score final/atual)
  const currentScores = scores.filter((score: any) => score.type_id === 1)
  
  let homeGoals = 0
  let awayGoals = 0

  currentScores.forEach((score: any) => {
    if (score.score && typeof score.score.goals === 'number') {
      if (score.score.participant === 'home') {
        homeGoals = score.score.goals
      } else if (score.score.participant === 'away') {
        awayGoals = score.score.goals
      }
    }
  })

  return { home: homeGoals, away: awayGoals }
} 