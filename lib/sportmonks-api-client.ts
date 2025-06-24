import type { SportMonksFixture, SportMonksFixtureDetails } from "@/app/(platform)/predicoes/types-sportmonks"

const API_BASE_URL = process.env.SPORTMONKS_BASE_URL || "https://api.sportmonks.com/v3"
const API_KEY = process.env.SPORTMONKS_API_KEY

async function fetchSportMonksApi<T>(endpoint: string, isDetailFetch = false): Promise<T> {
  if (!API_KEY) {
    throw new Error("SportMonks API key is not configured.")
  }
  // Para includes, a v3 usa vírgulas. Para selects (campos específicos), também.
  // O endpoint já virá com os includes formatados.
  const url = `${API_BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_token=${API_KEY}`

  console.log(`Fetching from SportMonks: ${url.replace(API_KEY, "REDACTED_API_KEY")}`)

  const res = await fetch(url, { next: { revalidate: isDetailFetch ? 600 : 300 } }) // Cache mais longo para detalhes

  if (!res.ok) {
    const errorBody = await res.text()
    console.error(
      `SportMonks API Error (${res.status}) for URL ${url.replace(API_KEY, "REDACTED_API_KEY")}: ${errorBody}`,
    )
    throw new Error(`Erro ao buscar dados da SportMonks (${res.status}): ${errorBody.substring(0, 200)}`)
  }
  const json = await res.json()
  return json
}

export async function fetchFixturesByDate(date: string): Promise<SportMonksFixture[]> {
  // Vamos começar com includes mínimos e válidos para v3.
  // 'participants' é o substituto de 'teams' em includes de fixtures.
  // 'league' é geralmente 'league;country' ou apenas 'league'. Vamos tentar 'league'.
  // 'scores' é para os placares.
  // 'odds' e 'statistics' podem ser mais pesados ou requerer planos específicos.
  // Vamos simplificar para 'league,participants,scores' inicialmente.
  const includes = "league,participants,scores" // Simplificado para diagnóstico
  const endpoint = `/football/fixtures/between/${date}/${date}?include=${includes}`

  try {
    const response = await fetchSportMonksApi<{ data: SportMonksFixture[] }>(endpoint)
    // Log da resposta para depuração
    console.log("SportMonks API Response for fetchFixturesByDate:", JSON.stringify(response, null, 2))

    return response.data || []
  } catch (error) {
    console.error("Error in fetchFixturesByDate:", error)
    return []
  }
}

export async function fetchFixtureDetails(fixtureId: number): Promise<SportMonksFixtureDetails | null> {
  // Para detalhes, os includes podem ser mais extensos.
  // Certifique-se que todos são válidos e permitidos.
  // A v3 usa vírgulas para separar includes.
  // statistics.type não é um include válido, é statistics com um select.
  // predictions.type também não. Seria predictions e depois filtrar pelo type.
  // Vamos usar includes que são mais prováveis de funcionar:
  const includes = "league,participants,scores,statistics,periods,odds" // Removido .type
  const endpoint = `/football/fixtures/${fixtureId}?include=${includes}`

  try {
    const response = await fetchSportMonksApi<{ data: SportMonksFixtureDetails }>(endpoint, true)
    console.log(
      `SportMonks API Response for fetchFixtureDetails (ID: ${fixtureId}):`,
      JSON.stringify(response, null, 2),
    )
    return response.data || null
  } catch (error) {
    console.error(`Error in fetchFixtureDetails for ID ${fixtureId}:`, error)
    return null
  }
}
