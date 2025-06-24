import { NextResponse } from "next/server"

const SPORTMONKS_BASE_URL = process.env.SPORTMONKS_BASE_URL || "https://api.sportmonks.com/v3"
const SPORTMONKS_API_KEY = process.env.SPORTMONKS_API_KEY

interface RouteContext {
  params: {
    fixtureId: string
  }
}

export async function GET(request: Request, context: RouteContext) {
  const { fixtureId } = context.params

  if (!fixtureId) {
    return NextResponse.json({ error: "Fixture ID is required." }, { status: 400 })
  }

  if (!SPORTMONKS_API_KEY) {
    console.error("SportMonks API key is not defined for fixture details.")
    return NextResponse.json({ error: "API key configuration error." }, { status: 500 })
  }

  const includes = "league;venue;state;scores;events.type;events.period;events.player;predictions.type;participants"
  // Adicionado 'participants' para garantir que temos os times no detalhe.
  const apiUrl = `${SPORTMONKS_BASE_URL}/football/fixtures/${fixtureId}?include=${includes}&api_token=${SPORTMONKS_API_KEY}`

  try {
    const response = await fetch(apiUrl, {
      next: { revalidate: 600 }, // Cache por 10 minutos, pois os detalhes de um jogo futuro não mudam tão rápido, mas predições podem.
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(
        `Error fetching fixture details from SportMonks (ID: ${fixtureId}): ${response.status} ${response.statusText}`,
        errorData,
      )
      return NextResponse.json(
        { error: `Failed to fetch fixture details. Status: ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json() // A API SportMonks geralmente retorna um objeto { data: {} }
    return NextResponse.json(data) // Retorna a resposta completa da API (que já tem a chave 'data')
  } catch (error: any) {
    console.error(`Error in fixture/${fixtureId} route handler:`, error)
    return NextResponse.json({ error: error.message || "Internal server error." }, { status: 500 })
  }
}
