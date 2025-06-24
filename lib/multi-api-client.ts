// Sistema Multi-API para maximizar disponibilidade e minimizar custos
export interface APIProvider {
  name: string
  priority: number // 1 = mais alto, 5 = mais baixo
  cost: 'free' | 'low' | 'medium' | 'high'
  rateLimit: number // requests per minute
  capabilities: {
    fixtures: boolean
    liveScores: boolean
    odds: boolean
    statistics: boolean
    predictions: boolean
    leagues: boolean
    teams: boolean
  }
}

export interface UnifiedFixture {
  id: string
  provider: string
  originalId: string | number
  homeTeam: { name: string, logo?: string }
  awayTeam: { name: string, logo?: string }
  league: { name: string, logo?: string }
  startTime: string
  status: 'scheduled' | 'live' | 'finished' | 'postponed'
  score?: { home: number, away: number }
  odds?: {
    home: number
    draw: number
    away: number
  }
}

// Configuração dos provedores por prioridade
export const API_PROVIDERS: APIProvider[] = [
  {
    name: 'TheSportsDB',
    priority: 1,
    cost: 'free',
    rateLimit: 300, // Sem limite oficial, mas vamos ser respeitosos
    capabilities: {
      fixtures: true,
      liveScores: true,
      odds: false, // TheSportsDB não tem odds
      statistics: true,
      predictions: false,
      leagues: true,
      teams: true
    }
  },
  {
    name: 'FootballData',
    priority: 2,
    cost: 'low',
    rateLimit: 100, // 100 req/min no plano free
    capabilities: {
      fixtures: true,
      liveScores: false, // Não tem live scores
      odds: false,
      statistics: true,
      predictions: false,
      leagues: true,
      teams: true
    }
  },
  {
    name: 'APIFootball',
    priority: 3,
    cost: 'low',
    rateLimit: 100, // 100 req/day no free, 10k no pago
    capabilities: {
      fixtures: true,
      liveScores: true,
      odds: true,
      statistics: true,
      predictions: true,
      leagues: true,
      teams: true
    }
  },
  {
    name: 'SportMonks',
    priority: 4, // Agora como fallback premium
    cost: 'high',
    rateLimit: 60,
    capabilities: {
      fixtures: true,
      liveScores: true,
      odds: true,
      statistics: true,
      predictions: true,
      leagues: true,
      teams: true
    }
  }
]

// Cache inteligente para otimizar requisições
class APICache {
  private cache = new Map<string, { data: any, timestamp: number, ttl: number }>()

  set(key: string, data: any, ttlSeconds: number = 300) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    })
  }

  get(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  clear() {
    this.cache.clear()
  }
}

// Rate limiter para cada API
class RateLimiter {
  private requests = new Map<string, number[]>()

  canMakeRequest(providerName: string, limit: number): boolean {
    const now = Date.now()
    const windowStart = now - 60000 // 1 minuto

    if (!this.requests.has(providerName)) {
      this.requests.set(providerName, [])
    }

    const requests = this.requests.get(providerName)!
    // Remove requisições antigas
    const recentRequests = requests.filter(time => time > windowStart)
    this.requests.set(providerName, recentRequests)

    return recentRequests.length < limit
  }

  recordRequest(providerName: string) {
    if (!this.requests.has(providerName)) {
      this.requests.set(providerName, [])
    }
    this.requests.get(providerName)!.push(Date.now())
  }
}

// Cliente multi-API principal
export class MultiAPIClient {
  private cache = new APICache()
  private rateLimiter = new RateLimiter()
  private providers: APIProvider[]

  constructor() {
    this.providers = API_PROVIDERS.sort((a, b) => a.priority - b.priority)
  }

  // Buscar fixtures com fallback automático
  async fetchFixtures(date: string): Promise<UnifiedFixture[]> {
    const cacheKey = `fixtures_${date}`
    const cached = this.cache.get(cacheKey)
    if (cached) {
      console.log(`📋 Cache hit para fixtures ${date}`)
      return cached
    }

    const errors: string[] = []

    for (const provider of this.providers) {
      if (!provider.capabilities.fixtures) continue

      if (!this.rateLimiter.canMakeRequest(provider.name, provider.rateLimit)) {
        console.warn(`⏰ Rate limit atingido para ${provider.name}`)
        continue
      }

      try {
        console.log(`🔄 Tentando buscar fixtures via ${provider.name}...`)
        
        let fixtures: UnifiedFixture[] = []
        
        switch (provider.name) {
          case 'TheSportsDB':
            fixtures = await this.fetchFromTheSportsDB(date)
            break
          case 'FootballData':
            fixtures = await this.fetchFromFootballData(date)
            break
          case 'APIFootball':
            fixtures = await this.fetchFromAPIFootball(date)
            break
          case 'SportMonks':
            fixtures = await this.fetchFromSportMonks(date)
            break
        }

        if (fixtures.length > 0) {
          console.log(`✅ ${provider.name}: ${fixtures.length} fixtures encontradas`)
          this.rateLimiter.recordRequest(provider.name)
          this.cache.set(cacheKey, fixtures, 300) // Cache por 5 minutos
          return fixtures
        }

      } catch (error) {
        const errorMsg = `${provider.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        errors.push(errorMsg)
        console.error(`❌ Falha em ${provider.name}:`, error)
      }
    }

    throw new Error(`Todas as APIs falharam: ${errors.join('; ')}`)
  }

  // Implementações específicas de cada API
  private async fetchFromTheSportsDB(date: string): Promise<UnifiedFixture[]> {
    // TheSportsDB usa formato diferente de data
    const apiDate = date.replace(/-/g, '-') // Já está no formato correto
    const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${date}&s=Soccer`)
    
    if (!response.ok) throw new Error(`TheSportsDB error: ${response.status}`)
    
    const data = await response.json()
    const events = data.events || []

    return events.map((event: any) => ({
      id: `thesportsdb_${event.idEvent}`,
      provider: 'TheSportsDB',
      originalId: event.idEvent,
      homeTeam: { 
        name: event.strHomeTeam,
        logo: event.strHomeTeamBadge 
      },
      awayTeam: { 
        name: event.strAwayTeam,
        logo: event.strAwayTeamBadge 
      },
      league: { 
        name: event.strLeague,
        logo: event.strLeagueBadge 
      },
      startTime: `${event.dateEvent}T${event.strTime}:00Z`,
      status: this.mapTheSportsDBStatus(event.strStatus),
      score: event.intHomeScore !== null ? {
        home: parseInt(event.intHomeScore) || 0,
        away: parseInt(event.intAwayScore) || 0
      } : undefined
    }))
  }

  private async fetchFromFootballData(date: string): Promise<UnifiedFixture[]> {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY
    if (!apiKey) throw new Error('FOOTBALL_DATA_API_KEY não configurada')

    const response = await fetch(`https://api.football-data.org/v4/matches?dateFrom=${date}&dateTo=${date}`, {
      headers: { 'X-Auth-Token': apiKey }
    })

    if (!response.ok) throw new Error(`FootballData error: ${response.status}`)

    const data = await response.json()
    const matches = data.matches || []

    return matches.map((match: any) => ({
      id: `footballdata_${match.id}`,
      provider: 'FootballData',
      originalId: match.id,
      homeTeam: { 
        name: match.homeTeam.name,
        logo: match.homeTeam.crest 
      },
      awayTeam: { 
        name: match.awayTeam.name,
        logo: match.awayTeam.crest 
      },
      league: { 
        name: match.competition.name,
        logo: match.competition.emblem 
      },
      startTime: match.utcDate,
      status: this.mapFootballDataStatus(match.status),
      score: match.score?.fullTime ? {
        home: match.score.fullTime.home || 0,
        away: match.score.fullTime.away || 0
      } : undefined
    }))
  }

  private async fetchFromAPIFootball(date: string): Promise<UnifiedFixture[]> {
    const apiKey = process.env.API_FOOTBALL_KEY
    if (!apiKey) throw new Error('API_FOOTBALL_KEY não configurada')

    const response = await fetch(`https://v3.football.api-sports.io/fixtures?date=${date}`, {
      headers: { 
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      }
    })

    if (!response.ok) throw new Error(`APIFootball error: ${response.status}`)

    const data = await response.json()
    const fixtures = data.response || []

    return fixtures.map((fixture: any) => ({
      id: `apifootball_${fixture.fixture.id}`,
      provider: 'APIFootball',
      originalId: fixture.fixture.id,
      homeTeam: { 
        name: fixture.teams.home.name,
        logo: fixture.teams.home.logo 
      },
      awayTeam: { 
        name: fixture.teams.away.name,
        logo: fixture.teams.away.logo 
      },
      league: { 
        name: fixture.league.name,
        logo: fixture.league.logo 
      },
      startTime: fixture.fixture.date,
      status: this.mapAPIFootballStatus(fixture.fixture.status.short),
      score: fixture.goals.home !== null ? {
        home: fixture.goals.home || 0,
        away: fixture.goals.away || 0
      } : undefined,
      odds: fixture.bookmakers?.[0]?.bets?.find((bet: any) => bet.name === 'Match Winner')?.values ? {
        home: parseFloat(fixture.bookmakers[0].bets.find((bet: any) => bet.name === 'Match Winner').values.find((v: any) => v.value === 'Home')?.odd || '0'),
        draw: parseFloat(fixture.bookmakers[0].bets.find((bet: any) => bet.name === 'Match Winner').values.find((v: any) => v.value === 'Draw')?.odd || '0'),
        away: parseFloat(fixture.bookmakers[0].bets.find((bet: any) => bet.name === 'Match Winner').values.find((v: any) => v.value === 'Away')?.odd || '0')
      } : undefined
    }))
  }

  private async fetchFromSportMonks(date: string): Promise<UnifiedFixture[]> {
    // Usar nossa implementação existente
    const { fetchFixturesByDate } = await import('./sportmonks-api-client')
    const fixtures = await fetchFixturesByDate(date)

    return fixtures.map(fixture => ({
      id: `sportmonks_${fixture.id}`,
      provider: 'SportMonks',
      originalId: fixture.id,
      homeTeam: { 
        name: fixture.participants?.find(p => p.meta?.location === 'home')?.name || 'Home',
        logo: fixture.participants?.find(p => p.meta?.location === 'home')?.image_path 
      },
      awayTeam: { 
        name: fixture.participants?.find(p => p.meta?.location === 'away')?.name || 'Away',
        logo: fixture.participants?.find(p => p.meta?.location === 'away')?.image_path 
      },
      league: { 
        name: (fixture.league as any)?.name || 'Unknown League',
      },
      startTime: fixture.starting_at,
      status: 'scheduled', // Simplificado por agora
      odds: fixture.processedOdds?.fullTimeResult ? {
        home: fixture.processedOdds.fullTimeResult.home,
        draw: fixture.processedOdds.fullTimeResult.draw,
        away: fixture.processedOdds.fullTimeResult.away
      } : undefined
    }))
  }

  // Mappers de status para unificar entre APIs
  private mapTheSportsDBStatus(status: string): UnifiedFixture['status'] {
    switch (status) {
      case 'Match Finished': return 'finished'
      case 'Not Started': return 'scheduled'
      default: return 'scheduled'
    }
  }

  private mapFootballDataStatus(status: string): UnifiedFixture['status'] {
    switch (status) {
      case 'FINISHED': return 'finished'
      case 'IN_PLAY': return 'live'
      case 'SCHEDULED': return 'scheduled'
      case 'POSTPONED': return 'postponed'
      default: return 'scheduled'
    }
  }

  private mapAPIFootballStatus(status: string): UnifiedFixture['status'] {
    switch (status) {
      case 'FT': return 'finished'
      case '1H': case '2H': case 'HT': return 'live'
      case 'NS': return 'scheduled'
      case 'PST': return 'postponed'
      default: return 'scheduled'
    }
  }

  // Método para obter informações sobre providers ativos
  getProviderStatus(): { name: string, available: boolean, cost: string }[] {
    return this.providers.map(provider => ({
      name: provider.name,
      available: this.rateLimiter.canMakeRequest(provider.name, provider.rateLimit),
      cost: provider.cost
    }))
  }
}

// Instância singleton
export const multiApiClient = new MultiAPIClient() 