import { NextResponse } from 'next/server'
import { validateAllAPIs, logAPIStatus } from '@/lib/api-validator'

export async function GET() {
  try {
    console.log('🔍 Iniciando validação de todas as APIs...')
    
    const validationResults = await validateAllAPIs()
    
    // Log no console para debug
    logAPIStatus(validationResults)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: validationResults,
      summary: {
        total: validationResults.length,
        valid: validationResults.filter(r => r.isValid).length,
        invalid: validationResults.filter(r => !r.isValid).length
      }
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