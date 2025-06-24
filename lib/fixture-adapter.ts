// SportMonks fixture utilities
import type { SportMonksFixture } from '@/app/(platform)/predicoes/types-sportmonks'

/**
 * Utilitário para determinar se uma fixture é de dados reais
 */
export function isRealFixture(fixture: SportMonksFixture): boolean {
  return !fixture.placeholder
}

/**
 * Utilitário para obter informações do provider SportMonks
 */
export function getFixtureProviderInfo(fixture: SportMonksFixture): {
  provider: string
  cost: 'high'
  hasRealOdds: boolean
} {
  return {
    provider: 'SportMonks',
    cost: 'high',
    hasRealOdds: !!fixture.processedOdds?.fullTimeResult
  }
} 