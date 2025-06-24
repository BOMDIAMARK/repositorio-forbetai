import { NextRequest, NextResponse } from 'next/server'
import { cacheManager } from '@/lib/redis-cache'

// Endpoint administrativo para gerenciar cache Redis
export async function GET() {
  try {
    const cacheInfo = cacheManager.getCacheInfo()
    
    return NextResponse.json({
      success: true,
      cache: {
        type: cacheInfo.type,
        connected: cacheInfo.connected,
        operations: {
          get: 'GET /api/cache-admin?action=status',
          invalidateFixtures: 'DELETE /api/cache-admin?type=fixtures&date=YYYY-MM-DD',
          invalidateValidations: 'DELETE /api/cache-admin?type=validations',
          invalidateAll: 'DELETE /api/cache-admin?type=all'
        }
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const date = searchParams.get('date')
    const provider = searchParams.get('provider')
    
    if (!type) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetro "type" é obrigatório'
      }, { status: 400 })
    }
    
    let invalidated = false
    let message = ''
    
    switch (type) {
      case 'fixtures':
        if (!date) {
          return NextResponse.json({
            success: false,
            error: 'Parâmetro "date" é obrigatório para invalidar fixtures'
          }, { status: 400 })
        }
        
        await cacheManager.invalidateFixtures(date, provider || undefined)
        invalidated = true
        message = `Cache de fixtures invalidado para ${date}${provider ? ` (provider: ${provider})` : ''}`
        break
        
      case 'validations':
        await cacheManager.invalidateAllValidations()
        invalidated = true
        message = 'Cache de validações de APIs invalidado'
        break
        
      case 'api-status':
        await cacheManager.invalidateAllValidations()
        // Também invalidar o status geral das APIs
        const statusKeys = ['api:status']
        for (const key of statusKeys) {
          // Note: não temos acesso direto ao del, mas invalidateAllValidations já faz isso
        }
        invalidated = true
        message = 'Cache de status das APIs invalidado'
        break
        
      default:
        return NextResponse.json({
          success: false,
          error: `Tipo de cache inválido: ${type}. Use: fixtures, validations, api-status`
        }, { status: 400 })
    }
    
    console.log(`🧹 Cache invalidado: ${message}`)
    
    return NextResponse.json({
      success: true,
      invalidated,
      message,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro ao invalidar cache:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

// Endpoint para estatísticas de cache (futuro)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    if (action === 'stats') {
      // Futuras estatísticas de cache
      return NextResponse.json({
        success: true,
        stats: {
          type: cacheManager.getCacheInfo().type,
          connected: cacheManager.isConnected(),
          message: 'Estatísticas detalhadas serão implementadas em versão futura'
        }
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Ação não suportada'
    }, { status: 400 })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
} 