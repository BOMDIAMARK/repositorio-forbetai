import { NextResponse } from "next/server"

const SPORTMONKS_BASE_URL = process.env.SPORTMONKS_BASE_URL || "https://api.sportmonks.com/v3"
const SPORTMONKS_API_KEY = process.env.SPORTMONKS_API_KEY

export async function GET(request: Request) {
  if (!SPORTMONKS_API_KEY) {
    console.error("SportMonks API key is not defined for upcoming fixtures.")
    return NextResponse.json({ error: "API key configuration error." }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const page = searchParams.get("page") || "1"
  const perPage = searchParams.get("per_page") || "15"
  const leagues = searchParams.get("leagues")

  const today = new Date()
  const sevenDaysLater = new Date(today)
  sevenDaysLater.setDate(today.getDate() + 7)

  const formatDateForApi = (date: Date) => date.toISOString().split("T")[0]

  const startDate = formatDateForApi(today)
  const endDate = formatDateForApi(sevenDaysLater)

  // Constructing the base URL for fixtures in a date range
  let apiUrl = `${SPORTMONKS_BASE_URL}/football/fixtures/between/${startDate}/${endDate}?include=league;participants&per_page=${perPage}&page=${page}&api_token=${SPORTMONKS_API_KEY}`

  // Conditionally add leagues if provided
  if (leagues) {
    apiUrl += `&leagues=${leagues}`
  }
  // Removed &sort=starting_at for testing, as it might cause issues if not supported or if the field name is different.
  // You can add it back if confirmed to be working: apiUrl += `&sort=starting_at`;

  console.log(`[Upcoming Fixtures] Calling SportMonks API: ${apiUrl.replace(SPORTMONKS_API_KEY, "REDACTED_API_KEY")}`)

  try {
    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 }, // Cache por 1 hora
    })

    if (!response.ok) {
      let errorBody = `SportMonks API responded with status ${response.status} ${response.statusText}.`
      const responseContentType = response.headers.get("content-type")

      if (responseContentType && responseContentType.includes("application/json")) {
        try {
          const sportMonksError = await response.json()
          errorBody += ` Body: ${JSON.stringify(sportMonksError)}`
        } catch (e) {
          errorBody += ` Failed to parse JSON error body.`
        }
      } else {
        try {
          const textError = await response.text()
          errorBody += ` Body (text): ${textError}`
        } catch (textE) {
          errorBody += ` Could not read error body as text.`
        }
      }
      console.error(
        `Error fetching upcoming fixtures from SportMonks. URL: ${apiUrl.replace(SPORTMONKS_API_KEY, "REDACTED_API_KEY")}. Details: ${errorBody}`,
      )
      return NextResponse.json(
        {
          error: `Failed to fetch upcoming fixtures. External API status: ${response.status}. Check server logs for more details.`,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    const transformedData = data.data.map((fixture: any) => ({
      id: fixture.id,
      name: fixture.name,
      leagueName: fixture.league?.name || "N/A",
      leagueLogo: fixture.league?.image_path,
      teamALogo:
        fixture.participants?.find((p: any) => p.meta?.location === "home")?.image_path ||
        "/placeholder.svg?width=32&height=32",
      teamBLogo:
        fixture.participants?.find((p: any) => p.meta?.location === "away")?.image_path ||
        "/placeholder.svg?width=32&height=32",
      matchDate: fixture.starting_at,
    }))

    return NextResponse.json({ data: transformedData, pagination: data.pagination })
  } catch (error: any) {
    console.error(`[Upcoming Fixtures] Error in route handler: ${error.message}`, error)
    return NextResponse.json({ error: error.message || "Internal server error." }, { status: 500 })
  }
}
