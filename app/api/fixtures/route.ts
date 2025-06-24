import { NextRequest, NextResponse } from 'next/server'
import { multiApiClient } from '@/lib/multi-api-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().slice(0, 10)
    
    // Validar formato da data
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ 
        error: 'Formato de data inválido. Use YYYY-MM-DD' 
      }, { status: 400 })
    }

    console.log(`🎯 Buscando fixtures para ${date} via sistema multi-API`)
    
    // Buscar fixtures com fallback automático
    const fixtures = await multiApiClient.fetchFixtures(date)
    
    // Obter status dos providers para debug
    const providerStatus = multiApiClient.getProviderStatus()
    
    return NextResponse.json({
      success: true,
      data: fixtures,
      meta: {
        date,
        count: fixtures.length,
        providers: providerStatus,
        cached: false // Implementar lógica de cache se necessário
      }
    })

  } catch (error) {
    console.error('❌ Erro no endpoint multi-API:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      data: []
    }, { status: 500 })
  }
} 