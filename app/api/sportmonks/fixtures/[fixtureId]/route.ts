import { NextResponse } from "next/server"
import { fetchFixtureDetails as fetchDetails } from "@/lib/sportmonks-api-client"

interface RouteContext {
  params: {
    fixtureId: string
  }
}

export async function GET(request: Request, context: RouteContext) {
  const { fixtureId } = context.params

  console.log(`🔍 API Route chamada para fixture: ${fixtureId}`)
  console.log(`📍 Environment check:`, {
    hasApiKey: !!process.env.SPORTMONKS_API_KEY,
    apiKeyPrefix: process.env.SPORTMONKS_API_KEY?.substring(0, 8),
    baseUrl: process.env.SPORTMONKS_BASE_URL
  })

  if (!fixtureId || isNaN(Number(fixtureId))) {
    console.error(`❌ Fixture ID inválido: ${fixtureId}`)
    return NextResponse.json({ error: "Fixture ID inválido." }, { status: 400 })
  }

  try {
    console.log(`🚀 Buscando detalhes para fixture ID: ${fixtureId}`)
    const details = await fetchDetails(Number(fixtureId))
    
    if (!details) {
      console.warn(`⚠️ Nenhum detalhe encontrado para fixture: ${fixtureId}`)
      return NextResponse.json({ error: "Detalhes do jogo não encontrados." }, { status: 404 })
    }
    
    console.log(`✅ Detalhes encontrados para fixture: ${fixtureId}`)
    return NextResponse.json(details)
  } catch (error: any) {
    console.error(`❌ Erro ao buscar detalhes para fixture ${fixtureId}:`, {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })
    return NextResponse.json({ 
      error: error.message || "Erro ao buscar detalhes do jogo.",
      debug: {
        fixtureId,
        hasApiKey: !!process.env.SPORTMONKS_API_KEY,
        baseUrl: process.env.SPORTMONKS_BASE_URL
      }
    }, { status: 500 })
  }
}
