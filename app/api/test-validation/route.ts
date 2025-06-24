import { NextResponse } from 'next/server'
import { validateAllAPIs, logAPIStatus } from '@/lib/api-validator'
import { cacheManager, addCacheHeaders, CACHE_CONFIG } from '@/lib/redis-cache'

export async function GET() {
  try {
    console.log('🔍 Iniciando validação de todas as APIs...')
    
    // Verificar cache primeiro
    const cachedStatus = await cacheManager.getAPIStatus()
    if (cachedStatus) {
      console.log('📋 Cache Redis hit para validação das APIs')
      const cacheHeaders = addCacheHeaders(CACHE_CONFIG.validationTTL)
      
      return NextResponse.json({
        ...cachedStatus,
        fromCache: true
      }, {
        headers: cacheHeaders
      })
    }
    
    const validationResults = await validateAllAPIs()
    
    // Log no console para debug
    logAPIStatus(validationResults)
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      results: validationResults,
      summary: {
        total: validationResults.length,
        valid: validationResults.filter(r => r.isValid).length,
        invalid: validationResults.filter(r => !r.isValid).length
      },
      cache: {
        type: cacheManager.getCacheInfo().type,
        ttl: CACHE_CONFIG.validationTTL
      }
    }
    
    // Salvar no cache para próximas requisições
    await cacheManager.setAPIStatus(response)
    
    const cacheHeaders = addCacheHeaders(CACHE_CONFIG.validationTTL)
    
    return NextResponse.json(response, {
      headers: cacheHeaders
    })

  } catch (error) {
    console.error('❌ Erro na validação das APIs:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 