import type { UnifiedFixture } from './multi-api-client'
import type { SportMonksFixture } from '@/app/(platform)/predicoes/types-sportmonks'

/**
 * Adaptador para converter fixtures unificadas em formato SportMonks
 * Permite usar fixtures de qualquer API com os componentes existentes
 */
export function adaptUnifiedFixtureToSportMonks(unifiedFixture: UnifiedFixture): SportMonksFixture {
  return {
    id: parseInt(unifiedFixture.originalId.toString()) || 0,
    league_id: 1, // Valor padrão para compatibilidade
    season_id: 1, // Valor padrão para compatibilidade  
    stage_id: 1, // Valor padrão para compatibilidade
    name: `${unifiedFixture.homeTeam.name} vs ${unifiedFixture.awayTeam.name}`,
    starting_at: unifiedFixture.startTime,
    result_info: null,
    leg: undefined,
    details: undefined,
    length: undefined,
    placeholder: false,
    // Adaptar participantes para o formato SportMonks
    participants: [
      {
        id: 1,
        sport_id: 1,
        country_id: 0,
        venue_id: null,
        gender: 'male',
        name: unifiedFixture.homeTeam.name,
        short_code: unifiedFixture.homeTeam.name.substring(0, 3).toUpperCase(),
        image_path: unifiedFixture.homeTeam.logo || null,
        founded: null,
        type: 'domestic',
        placeholder: false,
        last_played_at: null,
        meta: {
          location: 'home' as const,
          winner: null,
          position: null
        }
      },
      {
        id: 2,
        sport_id: 1,
        country_id: 0,
        venue_id: null,
        gender: 'male',
        name: unifiedFixture.awayTeam.name,
        short_code: unifiedFixture.awayTeam.name.substring(0, 3).toUpperCase(),
        image_path: unifiedFixture.awayTeam.logo || null,
        founded: null,
        type: 'domestic',
        placeholder: false,
        last_played_at: null,
        meta: {
          location: 'away' as const,
          winner: null,
          position: null
        }
      }
    ],
    // Adaptar liga
    league: {
      id: 1,
      sport_id: 1,
      country_id: 0,
      name: unifiedFixture.league.name,
      active: true,
      short_code: unifiedFixture.league.name.substring(0, 3).toUpperCase(),
      image_path: unifiedFixture.league.logo || null,
      type: 'domestic',
      sub_type: 'domestic',
      last_played_at: null,
      category: 1,
      has_jerseys: false
    },
    // Adaptar odds se disponíveis
    rawOdds: null,
    processedOdds: unifiedFixture.odds ? {
      fullTimeResult: {
        home: unifiedFixture.odds.home,
        draw: unifiedFixture.odds.draw,
        away: unifiedFixture.odds.away
      },
      bothTeamsToScore: null,
      totalGoals: null,
      correctScore: null,
      asianHandicap: null
    } : null,
    // Informações adicionais para identificar o provider
    _multiApi: {
      provider: unifiedFixture.provider,
      originalId: unifiedFixture.originalId,
      unifiedId: unifiedFixture.id,
      status: unifiedFixture.status,
      score: unifiedFixture.score
    }
  } as unknown as SportMonksFixture & { _multiApi: any }
}

/**
 * Adapta múltiplas fixtures unificadas
 */
export function adaptUnifiedFixturesToSportMonks(unifiedFixtures: UnifiedFixture[]): SportMonksFixture[] {
  return unifiedFixtures.map(adaptUnifiedFixtureToSportMonks)
}

/**
 * Cria um mock de fixture para fallback quando nenhuma API funciona
 */
export function createMockFixtures(): SportMonksFixture[] {
  const today = new Date()
  const mockTime = new Date(today.getTime() + 2 * 60 * 60 * 1000) // +2 horas

  return [
    {
      id: 999999,
      league_id: 999,
      season_id: 999,
      stage_id: 999,
      name: 'Exemplo vs Demonstração',
      starting_at: mockTime.toISOString(),
      result_info: null,
      leg: undefined,
      details: undefined,
      length: undefined,
      placeholder: true,
      participants: [
        {
          id: 99999,
          sport_id: 1,
          country_id: 55,
          venue_id: null,
          gender: 'male',
          name: 'Time Exemplo',
          short_code: 'EXE',
          image_path: null,
          founded: null,
          type: 'domestic',
          placeholder: true,
          last_played_at: null,
          meta: {
            location: 'home' as const,
            winner: null,
            position: null
          }
        },
        {
          id: 99998,
          sport_id: 1,
          country_id: 55,
          venue_id: null,
          gender: 'male',
          name: 'Time Demonstração',
          short_code: 'DEM',
          image_path: null,
          founded: null,
          type: 'domestic',
          placeholder: true,
          last_played_at: null,
          meta: {
            location: 'away' as const,
            winner: null,
            position: null
          }
        }
      ],
      league: {
        id: 999,
        sport_id: 1,
        country_id: 55,
        name: 'Liga Exemplo',
        active: true,
        short_code: 'LEX',
        image_path: null,
        type: 'domestic',
        sub_type: 'domestic',
        last_played_at: null,
        category: 1,
        has_jerseys: false
      },
      rawOdds: null,
      processedOdds: {
        fullTimeResult: {
          home: 2.10,
          draw: 3.20,
          away: 2.80
        },
        bothTeamsToScore: null,
        totalGoals: null,
        correctScore: null,
        asianHandicap: null
      },
      _multiApi: {
        provider: 'Mock',
        originalId: 'mock_999999',
        unifiedId: 'mock_999999',
        status: 'scheduled' as const,
        score: undefined
      }
    } as unknown as SportMonksFixture & { _multiApi: any }
  ]
}

/**
 * Utilitário para determinar se uma fixture é de dados reais ou mock
 */
export function isRealFixture(fixture: SportMonksFixture & { _multiApi?: any }): boolean {
  return !fixture.placeholder && fixture._multiApi?.provider !== 'Mock'
}

/**
 * Utilitário para obter informações do provider
 */
export function getFixtureProviderInfo(fixture: SportMonksFixture & { _multiApi?: any }): {
  provider: string
  cost: 'free' | 'low' | 'medium' | 'high'
  hasRealOdds: boolean
} {
  const provider = fixture._multiApi?.provider || 'SportMonks'
  
  const providerCostMap: Record<string, 'free' | 'low' | 'medium' | 'high'> = {
    'TheSportsDB': 'free',
    'FootballData': 'low',
    'APIFootball': 'low',
    'SportMonks': 'high',
    'Mock': 'free'
  }

  return {
    provider,
    cost: providerCostMap[provider] || 'medium',
    hasRealOdds: !!fixture.processedOdds?.fullTimeResult && provider !== 'Mock'
  }
} 