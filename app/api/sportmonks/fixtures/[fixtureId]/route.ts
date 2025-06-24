import { NextResponse } from "next/server"
import { fetchFixtureDetails as fetchDetails } from "@/lib/sportmonks-api-client"

interface RouteContext {
  params: {
    fixtureId: string
  }
}

export async function GET(request: Request, context: RouteContext) {
  const { fixtureId } = context.params

  if (!fixtureId || isNaN(Number(fixtureId))) {
    return NextResponse.json({ error: "Fixture ID inválido." }, { status: 400 })
  }

  try {
    const details = await fetchDetails(Number(fixtureId))
    if (!details) {
      return NextResponse.json({ error: "Detalhes do jogo não encontrados." }, { status: 404 })
    }
    return NextResponse.json(details)
  } catch (error: any) {
    console.error(`API Error fetching details for fixture ${fixtureId}:`, error)
    return NextResponse.json({ error: error.message || "Erro ao buscar detalhes do jogo." }, { status: 500 })
  }
}
