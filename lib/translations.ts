// Traduções para português - centralizando termos do sistema
export const translations = {
  // Mercados de apostas
  markets: {
    'Over 2.5': 'Mais de 2.5',
    'Under 2.5': 'Menos de 2.5',
    'Over 1.5': 'Mais de 1.5',
    'Under 1.5': 'Menos de 1.5',
    'Over 3.5': 'Mais de 3.5',
    'Under 3.5': 'Menos de 3.5',
    'Over 0.5': 'Mais de 0.5',
    'Under 0.5': 'Menos de 0.5',
    'Over 4.5': 'Mais de 4.5',
    'Under 4.5': 'Menos de 4.5',
    'Over 9.5': 'Mais de 9.5',
    'Under 9.5': 'Menos de 9.5',
    'BTTS': 'Ambas Marcam',
    'Both Teams To Score': 'Ambas as Equipes Marcam',
    'Both Teams to Score': 'Ambas as Equipes Marcam',
    'Yes': 'Sim',
    'No': 'Não',
    'Home': 'Casa',
    'Away': 'Visitante',
    'Draw': 'Empate',
    '1X2': 'Resultado Final',
    'Match Winner': 'Vencedor da Partida',
    'Full Time Result': 'Resultado Final',
    'Asian Handicap': 'Handicap Asiático',
    'Correct Score': 'Placar Correto',
    'Total Goals': 'Total de Gols',
    'Corners': 'Escanteios',
    'Cards': 'Cartões',
    'Yellow Cards': 'Cartões Amarelos',
    'Red Cards': 'Cartões Vermelhos'
  },
  
  // Status do jogo
  status: {
    'LIVE': 'AO VIVO',
    'FT': 'Final',
    'HT': 'Intervalo',
    'SCHEDULED': 'Agendado',
    'POSTPONED': 'Adiado',
    'CANCELLED': 'Cancelado',
    'FINISHED': 'Finalizado',
    'FIRST_HALF': 'Primeiro Tempo',
    'SECOND_HALF': 'Segundo Tempo',
    'EXTRA_TIME': 'Prorrogação',
    'PENALTY_SHOOTOUT': 'Pênaltis'
  },

  // Confiança da IA
  confidence: {
    'Very High': 'Muito Alta',
    'High': 'Alta', 
    'Medium': 'Média',
    'Low': 'Baixa',
    'Very Low': 'Muito Baixa'
  },

  // Tipos de estatísticas
  statistics: {
    'Goals': 'Gols',
    'Shots': 'Chutes',
    'Shots on Target': 'Chutes ao Gol',
    'Possession': 'Posse de Bola',
    'Corners': 'Escanteios',
    'Yellow Cards': 'Cartões Amarelos',
    'Red Cards': 'Cartões Vermelhos',
    'Fouls': 'Faltas',
    'Offsides': 'Impedimentos',
    'Saves': 'Defesas',
    'Passes': 'Passes',
    'Pass Accuracy': 'Precisão de Passe',
    'Crosses': 'Cruzamentos',
    'Tackles': 'Desarmes',
    'Interceptions': 'Interceptações',
    'Free Kicks': 'Tiros Livres',
    'Throw Ins': 'Laterais',
    'Goal Kicks': 'Tiros de Meta'
  },

  // Eventos do jogo
  events: {
    'goal': 'Gol',
    'yellow_card': 'Cartão Amarelo',
    'red_card': 'Cartão Vermelho',
    'substitution': 'Substituição',
    'penalty': 'Pênalti',
    'own_goal': 'Gol Contra',
    'assist': 'Assistência',
    'corner': 'Escanteio',
    'free_kick': 'Tiro Livre',
    'offside': 'Impedimento',
    'foul': 'Falta'
  },

  // Descrições de probabilidade
  probability: {
    'Very Likely': 'Muito Provável',
    'Likely': 'Provável', 
    'Balanced': 'Equilibrado',
    'Unlikely': 'Improvável',
    'Very Unlikely': 'Muito Improvável'
  },

  // Posições dos jogadores
  positions: {
    'Goalkeeper': 'Goleiro',
    'Defender': 'Zagueiro',
    'Midfielder': 'Meio-campista',
    'Forward': 'Atacante',
    'Left Back': 'Lateral Esquerdo',
    'Right Back': 'Lateral Direito',
    'Centre Back': 'Zagueiro Central',
    'Defensive Midfielder': 'Volante',
    'Central Midfielder': 'Meio-campo Central',
    'Attacking Midfielder': 'Meio-campista Ofensivo',
    'Left Winger': 'Ponta Esquerda',
    'Right Winger': 'Ponta Direita',
    'Striker': 'Centroavante'
  }
}

// Função para traduzir termo específico
export function translateTerm(term: string, category: keyof typeof translations): string {
  const categoryTranslations = translations[category] as Record<string, string>
  return categoryTranslations[term] || term
}

// Função para traduzir múltiplos termos de uma categoria
export function translateMarket(marketName: string): string {
  return translateTerm(marketName, 'markets')
}

export function translateStatus(status: string): string {
  return translateTerm(status, 'status')
}

export function translateStatistic(statName: string): string {
  return translateTerm(statName, 'statistics')
}

export function translateEvent(eventType: string): string {
  return translateTerm(eventType, 'events')
}

export function translateProbability(description: string): string {
  return translateTerm(description, 'probability')
}

// Função para formatar porcentagem em português
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

// Função para formatar odds em português
export function formatOddsPortuguese(odd: number): string {
  if (odd === 0) return '-.--'
  return odd.toFixed(2).replace('.', ',')
}

// Função para calcular probabilidade implícita em português
export function calculateImpliedProbabilityPT(odd: number): string {
  if (odd === 0) return '0%'
  const probability = (1 / odd) * 100
  return formatPercentage(probability)
} 