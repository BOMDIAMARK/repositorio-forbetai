import { Redis } from '@upstash/redis'
import IORedis from 'ioredis'

export interface CacheConfig {
  defaultTTL: number // TTL padrão em segundos
  fixturesTTL: number // TTL para fixtures (mais longo)
  validationTTL: number // TTL para validação de APIs (mais curto)
  liveDataTTL: number // TTL para dados ao vivo (muito curto)
  oddsTTL: number // TTL para odds (volátil)
  predictionsTTL: number // TTL para predições (estável)
  enrichedDataTTL: number // TTL para dados enriquecidos (muito estável)
}

export const CACHE_CONFIG: CacheConfig = {
  defaultTTL: 300, // 5 minutos
  fixturesTTL: 600, // 10 minutos
  validationTTL: 180, // 3 minutos
  liveDataTTL: 30, // 30 segundos
  oddsTTL: 600, // 10 minutos (odds mudam frequentemente)
  predictionsTTL: 1800, // 30 minutos (algoritmos são mais estáveis)
  enrichedDataTTL: 3600 // 1 hora (dados estruturais)
}

// Cache keys com prefixos organizados
export const CACHE_KEYS = {
  fixtures: (date: string, provider?: string) => 
    `fixtures:${date}${provider ? `:${provider}` : ''}`,
  validation: (provider: string) => 
    `validation:${provider}`,
  liveScores: (date: string) => 
    `live:${date}`,
  apiStatus: () => 
    'api:status',
  rateLimit: (provider: string) => 
    `ratelimit:${provider}`,
  odds: (fixtureId: number | string) => 
    `odds:detailed:${fixtureId}`,
  predictions: (fixtureId?: number | string, date?: string) => 
    fixtureId ? `predictions:fixture:${fixtureId}` : `predictions:${date}`,
  enriched: (fixtureId: number | string) => 
    `enriched:fixture:${fixtureId}`,
  teamLogos: (teamIds: number[]) => 
    `teams:logos:${teamIds.sort().join(',')}`
}

// Interface unificada para cache
export interface CacheClient {
  get<T>(key: string): Promise<T | null>
  set(key: string, value: any, ttl?: number): Promise<void>
  del(key: string): Promise<void>
  clear?(): Promise<void>
  isConnected(): boolean
}

// Cliente Redis Cloud para produção (ioredis)
class RedisCloudClient implements CacheClient {
  private redis: IORedis | null = null
  private connected = false

  constructor() {
    try {
      const redisUrl = process.env.REDIS_URL

      if (redisUrl) {
        this.redis = new IORedis(redisUrl, {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          connectTimeout: 10000
        })

        // Verificar conexão
        this.redis.ping().then(() => {
          this.connected = true
          console.log('✅ Redis Cloud conectado com sucesso')
        }).catch((error) => {
          console.error('❌ Erro ao conectar Redis Cloud:', error)
          this.connected = false
        })

        // Event listeners para monitoramento
        this.redis.on('connect', () => {
          console.log('🔗 Redis Cloud conectado')
          this.connected = true
        })

        this.redis.on('error', (error) => {
          console.error('❌ Erro Redis Cloud:', error)
          this.connected = false
        })

        this.redis.on('close', () => {
          console.log('🔌 Redis Cloud desconectado')
          this.connected = false
        })

      } else {
        console.log('⚠️ REDIS_URL não encontrada')
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar Redis Cloud:', error)
    }
  }

  isConnected(): boolean {
    return this.connected && this.redis !== null
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis || !this.connected) return null
    
    try {
      const result = await this.redis.get(key)
      if (!result) return null
      
      // Parse JSON se for string
      if (typeof result === 'string') {
        try {
          return JSON.parse(result) as T
        } catch {
          return result as T
        }
      }
      
      return result as T
    } catch (error) {
      console.error(`❌ Erro ao buscar cache Redis Cloud [${key}]:`, error)
      return null
    }
  }

  async set(key: string, value: any, ttl: number = CACHE_CONFIG.defaultTTL): Promise<void> {
    if (!this.redis || !this.connected) return

    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value)
      await this.redis.setex(key, ttl, serialized)
      console.log(`💾 Cache salvo no Redis Cloud [${key}] TTL: ${ttl}s`)
    } catch (error) {
      console.error(`❌ Erro ao salvar cache Redis Cloud [${key}]:`, error)
    }
  }

  async del(key: string): Promise<void> {
    if (!this.redis || !this.connected) return

    try {
      await this.redis.del(key)
      console.log(`🗑️ Cache removido do Redis Cloud [${key}]`)
    } catch (error) {
      console.error(`❌ Erro ao remover cache Redis Cloud [${key}]:`, error)
    }
  }

  // Método para fechar conexão quando necessário
  disconnect(): void {
    if (this.redis) {
      this.redis.disconnect()
      this.connected = false
    }
  }
}

// Cliente Redis para produção (Upstash)
class UpstashRedisClient implements CacheClient {
  private redis: Redis | null = null
  private connected = false

  constructor() {
    try {
      const redisUrl = process.env.UPSTASH_REDIS_REST_URL
      const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

      if (redisUrl && redisToken) {
        this.redis = new Redis({
          url: redisUrl,
          token: redisToken
        })
        this.connected = true
        console.log('✅ Redis (Upstash) conectado com sucesso')
      } else {
        console.log('⚠️ Credenciais do Upstash Redis não encontradas')
      }
    } catch (error) {
      console.error('❌ Erro ao conectar Redis:', error)
    }
  }

  isConnected(): boolean {
    return this.connected && this.redis !== null
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null
    
    try {
      const result = await this.redis.get(key)
      return result ? (result as T) : null
    } catch (error) {
      console.error(`❌ Erro ao buscar cache Redis [${key}]:`, error)
      return null
    }
  }

  async set(key: string, value: any, ttl: number = CACHE_CONFIG.defaultTTL): Promise<void> {
    if (!this.redis) return

    try {
      await this.redis.set(key, value, { ex: ttl })
      console.log(`💾 Cache salvo [${key}] TTL: ${ttl}s`)
    } catch (error) {
      console.error(`❌ Erro ao salvar cache Redis [${key}]:`, error)
    }
  }

  async del(key: string): Promise<void> {
    if (!this.redis) return

    try {
      await this.redis.del(key)
      console.log(`🗑️ Cache removido [${key}]`)
    } catch (error) {
      console.error(`❌ Erro ao remover cache Redis [${key}]:`, error)
    }
  }
}

// Cliente de fallback para desenvolvimento (memoria)
class MemoryCacheClient implements CacheClient {
  private cache = new Map<string, { data: any, expires: number }>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Limpeza automática a cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)

    console.log('✅ Cache em memória ativado (desenvolvimento)')
  }

  isConnected(): boolean {
    return true
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    
    return item.data as T
  }

  async set(key: string, value: any, ttl: number = CACHE_CONFIG.defaultTTL): Promise<void> {
    const expires = Date.now() + (ttl * 1000)
    this.cache.set(key, { data: value, expires })
    console.log(`💾 Cache salvo em memória [${key}] TTL: ${ttl}s`)
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key)
    console.log(`🗑️ Cache removido da memória [${key}]`)
  }

  async clear(): Promise<void> {
    this.cache.clear()
    console.log('🧹 Cache em memória limpo')
  }

  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key)
        cleaned++
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Limpeza automática: ${cleaned} itens expirados removidos`)
    }
  }

  // Limpar intervalo quando não precisar mais
  destroy(): void {
    clearInterval(this.cleanupInterval)
  }
}

// Factory para criar o cliente apropriado
function createCacheClient(): CacheClient {
  // Tentar Redis Cloud primeiro (se REDIS_URL estiver configurada)
  if (process.env.REDIS_URL) {
    const redisCloudClient = new RedisCloudClient()
    return redisCloudClient // Retorna mesmo se não conectado ainda (lazy connect)
  }
  
  // Em produção, tentar Upstash como segunda opção
  if (process.env.NODE_ENV === 'production' || process.env.UPSTASH_REDIS_REST_URL) {
    const upstashClient = new UpstashRedisClient()
    if (upstashClient.isConnected()) {
      return upstashClient
    }
  }
  
  // Fallback para cache em memória
  return new MemoryCacheClient()
}

// Cliente singleton
export const cacheClient = createCacheClient()

// Funções de conveniência para diferentes tipos de cache
export class CacheManager {
  private client: CacheClient

  constructor(client: CacheClient = cacheClient) {
    this.client = client
  }

  // Cache para fixtures com TTL longo
  async getFixtures(date: string, provider?: string): Promise<any[] | null> {
    const key = CACHE_KEYS.fixtures(date, provider)
    return await this.client.get<any[]>(key)
  }

  async setFixtures(date: string, fixtures: any[], provider?: string): Promise<void> {
    const key = CACHE_KEYS.fixtures(date, provider)
    await this.client.set(key, fixtures, CACHE_CONFIG.fixturesTTL)
  }

  // Cache para validação de APIs com TTL médio
  async getValidation(provider: string): Promise<any | null> {
    const key = CACHE_KEYS.validation(provider)
    return await this.client.get<any>(key)
  }

  async setValidation(provider: string, result: any): Promise<void> {
    const key = CACHE_KEYS.validation(provider)
    await this.client.set(key, result, CACHE_CONFIG.validationTTL)
  }

  // Cache para live scores com TTL curto
  async getLiveScores(date: string): Promise<any[] | null> {
    const key = CACHE_KEYS.liveScores(date)
    return await this.client.get<any[]>(key)
  }

  async setLiveScores(date: string, scores: any[]): Promise<void> {
    const key = CACHE_KEYS.liveScores(date)
    await this.client.set(key, scores, CACHE_CONFIG.liveDataTTL)
  }

  // Cache para status geral das APIs
  async getAPIStatus(): Promise<any | null> {
    const key = CACHE_KEYS.apiStatus()
    return await this.client.get<any>(key)
  }

  async setAPIStatus(status: any): Promise<void> {
    const key = CACHE_KEYS.apiStatus()
    await this.client.set(key, status, CACHE_CONFIG.validationTTL)
  }

  // Invalidar cache específico
  async invalidateFixtures(date: string, provider?: string): Promise<void> {
    const key = CACHE_KEYS.fixtures(date, provider)
    await this.client.del(key)
  }

  // Invalidar todas as validações (quando API volta a funcionar)
  async invalidateAllValidations(): Promise<void> {
    // Como não temos SCAN no Upstash, vamos invalidar providers conhecidos
    const providers = ['TheSportsDB', 'FootballData', 'APIFootball', 'SportMonks']
    
    for (const provider of providers) {
      const key = CACHE_KEYS.validation(provider)
      await this.client.del(key)
    }
    
    console.log('🧹 Cache de validações invalidado')
  }

  // Cache para odds detalhadas com TTL otimizado
  async getOdds(fixtureId: number | string): Promise<any | null> {
    const key = CACHE_KEYS.odds(fixtureId)
    return await this.client.get<any>(key)
  }

  async setOdds(fixtureId: number | string, odds: any): Promise<void> {
    const key = CACHE_KEYS.odds(fixtureId)
    await this.client.set(key, odds, CACHE_CONFIG.oddsTTL)
  }

  // Cache para predições com TTL longo
  async getPredictions(fixtureId?: number | string, date?: string): Promise<any | null> {
    const key = CACHE_KEYS.predictions(fixtureId, date)
    return await this.client.get<any>(key)
  }

  async setPredictions(predictions: any, fixtureId?: number | string, date?: string): Promise<void> {
    const key = CACHE_KEYS.predictions(fixtureId, date)
    await this.client.set(key, predictions, CACHE_CONFIG.predictionsTTL)
  }

  // Cache para dados enriquecidos com TTL muito longo
  async getEnrichedData(fixtureId: number | string): Promise<any | null> {
    const key = CACHE_KEYS.enriched(fixtureId)
    return await this.client.get<any>(key)
  }

  async setEnrichedData(fixtureId: number | string, data: any): Promise<void> {
    const key = CACHE_KEYS.enriched(fixtureId)
    await this.client.set(key, data, CACHE_CONFIG.enrichedDataTTL)
  }

  // Cache para logos de times (dados muito estáveis)
  async getTeamLogos(teamIds: number[]): Promise<any[] | null> {
    const key = CACHE_KEYS.teamLogos(teamIds)
    return await this.client.get<any[]>(key)
  }

  async setTeamLogos(teamIds: number[], logos: any[]): Promise<void> {
    const key = CACHE_KEYS.teamLogos(teamIds)
    // Logos raramente mudam, TTL longo
    await this.client.set(key, logos, 86400) // 24 horas
  }

  // Status do cache
  isConnected(): boolean {
    return this.client.isConnected()
  }

  getCacheInfo(): { type: string, connected: boolean } {
    const isRedisCloud = this.client instanceof RedisCloudClient
    const isUpstash = this.client instanceof UpstashRedisClient
    
    let type = 'Memory'
    if (isRedisCloud) type = 'Redis Cloud'
    else if (isUpstash) type = 'Redis (Upstash)'
    
    return {
      type,
      connected: this.client.isConnected()
    }
  }
}

// Instância singleton
export const cacheManager = new CacheManager()

// Utilitário para gerar chaves de cache consistentes
export function generateCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.filter(p => p !== undefined && p !== null).join(':')}`
}

// Middleware para adicionar headers de cache nas respostas
export function addCacheHeaders(ttl: number = CACHE_CONFIG.defaultTTL) {
  return {
    'Cache-Control': `public, max-age=${ttl}, s-maxage=${ttl}`,
    'X-Cache-TTL': ttl.toString(),
    'X-Cache-Provider': cacheManager.getCacheInfo().type
  }
} 