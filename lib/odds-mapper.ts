export interface SportMonksOdd {
  id: number;
  fixture_id: number;
  market_id: number;
  bookmaker_id: number;
  label: string;
  value: string;
  name: string;
  sort_order: number;
  market_description: string;
  probability: string;
  dp3: string;
  fractional: string;
  american: string;
  winning: boolean;
  stopped: boolean;
  total?: string;
  handicap?: string;
  participants?: string;
}

export interface ProcessedOdds {
  fullTimeResult?: {
    home: number;
    draw: number;
    away: number;
  };
  bothTeamsToScore?: {
    yes: number;
    no: number;
  };
  totalGoals?: {
    over25: number;
    under25: number;
    over15: number;
    under15: number;
    over35: number;
    under35: number;
  };
  correctScore?: Array<{
    score: string;
    odd: number;
  }>;
  asianHandicap?: Array<{
    handicap: string;
    home: number;
    away: number;
  }>;
}

// Mapeamento dos market_ids para português
export const MARKET_TRANSLATIONS = {
  1: 'Resultado Final', // Full Time Result
  2: 'Ambas Marcam', // Both Teams to Score  
  3: 'Total de Gols', // Goals Over/Under
  4: 'Placar Correto', // Correct Score
  5: 'Handicap Asiático', // Asian Handicap
  6: 'Dupla Chance', // Double Chance
  7: 'Primeiro Tempo', // First Half Result
  8: 'Segundo Tempo', // Second Half Result
} as const;

// Seleção das melhores odds por mercado (maior valor por opção)
export function getBestOdds(odds: SportMonksOdd[]): ProcessedOdds {
  const processed: ProcessedOdds = {};

  // 1. Full Time Result (Market ID 1)
  const fullTimeOdds = odds.filter(odd => 
    odd.market_id === 1 && 
    (odd.market_description === 'Full Time Result' || 
     odd.market_description === 'Match Winner' || 
     odd.market_description === 'Fulltime Result')
  );

  if (fullTimeOdds.length > 0) {
    const homeOdds = fullTimeOdds.filter(o => o.label === 'Home').map(o => parseFloat(o.value));
    const drawOdds = fullTimeOdds.filter(o => o.label === 'Draw').map(o => parseFloat(o.value));
    const awayOdds = fullTimeOdds.filter(o => o.label === 'Away').map(o => parseFloat(o.value));

    processed.fullTimeResult = {
      home: homeOdds.length > 0 ? Math.max(...homeOdds) : 0,
      draw: drawOdds.length > 0 ? Math.max(...drawOdds) : 0,
      away: awayOdds.length > 0 ? Math.max(...awayOdds) : 0,
    };
  }

  // 2. Both Teams to Score
  const bttsOdds = odds.filter(odd => 
    odd.market_description === 'Both Teams to Score' || 
    odd.market_description === 'Both Teams To Score'
  );

  if (bttsOdds.length > 0) {
    const yesOdds = bttsOdds.filter(o => o.label === 'Yes').map(o => parseFloat(o.value));
    const noOdds = bttsOdds.filter(o => o.label === 'No').map(o => parseFloat(o.value));

    processed.bothTeamsToScore = {
      yes: yesOdds.length > 0 ? Math.max(...yesOdds) : 0,
      no: noOdds.length > 0 ? Math.max(...noOdds) : 0,
    };
  }

  // 3. Total Goals (Over/Under)
  const totalGoalsOdds = odds.filter(odd => 
    odd.market_description === 'Goals Over/Under' ||
    odd.market_description === 'Total Goals' ||
    odd.market_description === 'Goal Line' ||
    odd.market_description === 'Alternative Goal Line'
  );

  if (totalGoalsOdds.length > 0) {
    const over25 = totalGoalsOdds.filter(o => o.label === 'Over' && o.total === '2.5').map(o => parseFloat(o.value));
    const under25 = totalGoalsOdds.filter(o => o.label === 'Under' && o.total === '2.5').map(o => parseFloat(o.value));
    const over15 = totalGoalsOdds.filter(o => o.label === 'Over' && o.total === '1.5').map(o => parseFloat(o.value));
    const under15 = totalGoalsOdds.filter(o => o.label === 'Under' && o.total === '1.5').map(o => parseFloat(o.value));
    const over35 = totalGoalsOdds.filter(o => o.label === 'Over' && o.total === '3.5').map(o => parseFloat(o.value));
    const under35 = totalGoalsOdds.filter(o => o.label === 'Under' && o.total === '3.5').map(o => parseFloat(o.value));

    processed.totalGoals = {
      over25: over25.length > 0 ? Math.max(...over25) : 0,
      under25: under25.length > 0 ? Math.max(...under25) : 0,
      over15: over15.length > 0 ? Math.max(...over15) : 0,
      under15: under15.length > 0 ? Math.max(...under15) : 0,
      over35: over35.length > 0 ? Math.max(...over35) : 0,
      under35: under35.length > 0 ? Math.max(...under35) : 0,
    };
  }

  // 4. Correct Score
  const correctScoreOdds = odds.filter(odd => 
    odd.market_description === 'Correct Score'
  );

  if (correctScoreOdds.length > 0) {
    const scoreGroups = correctScoreOdds.reduce((acc, odd) => {
      if (!acc[odd.label]) {
        acc[odd.label] = [];
      }
      acc[odd.label].push(parseFloat(odd.value));
      return acc;
    }, {} as Record<string, number[]>);

    processed.correctScore = Object.entries(scoreGroups)
      .map(([score, values]) => ({
        score,
        odd: Math.max(...values)
      }))
      .sort((a, b) => a.odd - b.odd) // Ordenar por odd (menor = mais provável)
      .slice(0, 10); // Top 10 placares mais prováveis
  }

  // 5. Asian Handicap
  const asianHandicapOdds = odds.filter(odd => 
    odd.market_description === 'Asian Handicap' ||
    odd.market_description === 'Alternative Asian Handicap'
  );

  if (asianHandicapOdds.length > 0) {
    const handicapGroups = asianHandicapOdds.reduce((acc, odd) => {
      const handicap = odd.handicap || '0';
      if (!acc[handicap]) {
        acc[handicap] = { home: [], away: [] };
      }
      
      if (odd.label === 'Home') {
        acc[handicap].home.push(parseFloat(odd.value));
      } else if (odd.label === 'Away') {
        acc[handicap].away.push(parseFloat(odd.value));
      }
      
      return acc;
    }, {} as Record<string, { home: number[], away: number[] }>);

    processed.asianHandicap = Object.entries(handicapGroups)
      .map(([handicap, values]) => ({
        handicap,
        home: values.home.length > 0 ? Math.max(...values.home) : 0,
        away: values.away.length > 0 ? Math.max(...values.away) : 0,
      }))
      .filter(h => h.home > 0 && h.away > 0)
      .slice(0, 5); // Top 5 handicaps
  }

  return processed;
}

// Formatação de odds para exibição
export function formatOdd(value: number): string {
  if (value === 0) return 'N/A';
  return value.toFixed(2);
}

// Cálculo de probabilidade implícita
export function calculateImpliedProbability(odd: number): string {
  if (odd === 0) return '0%';
  const probability = (1 / odd) * 100;
  return `${probability.toFixed(1)}%`;
}

// Determinar cor da odd baseada no valor (verde = favorito, vermelho = azarão)
export function getOddColor(value: number): string {
  if (value === 0) return 'text-gray-400';
  if (value <= 1.5) return 'text-green-400'; // Muito favorito
  if (value <= 2.5) return 'text-green-300'; // Favorito
  if (value <= 4.0) return 'text-yellow-400'; // Equilibrado
  if (value <= 6.0) return 'text-orange-400'; // Azarão
  return 'text-red-400'; // Muito azarão
} 