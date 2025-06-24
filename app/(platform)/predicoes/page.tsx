import { SportmonksPredictionCard } from "@/components/sportmonks-predictions/sportmonks-prediction-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CalendarX, AlertTriangle, Trophy } from "lucide-react"

// Buscar fixtures diretamente via SportMonks API
async function fetchFixtures(date: string) {
  try {
    // Usar a função diretamente em vez de fetch HTTP para evitar problemas de URL
    // Isso é mais eficiente e evita problemas de rede internos
    const { fetchFixturesByDate } = await import('@/lib/sportmonks-api-client')
    const fixtures = await fetchFixturesByDate(date)
    
    return {
      success: true,
      data: fixtures,
      meta: {
        date,
        count: fixtures.length,
        provider: 'SportMonks'
      }
    }
  } catch (error) {
    console.error('Erro no fetch SportMonks:', error)
    throw error
  }
}

export default async function PredictionsPageSportmonks() {
  const today = new Date().toISOString().slice(0, 10)
  let fixtures = []
  let errorFetching: string | null = null
  let apiMeta: any = null

  try {
    const result = await fetchFixtures(today)
    fixtures = result.data || []
    apiMeta = result.meta
  } catch (error: any) {
    console.error("Erro ao carregar fixtures na página:", error)
    errorFetching = error.message || "Falha ao carregar jogos."
    fixtures = [] // Ensure fixtures is an array even on error
  }

  const pageDate = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Predições dos Jogos</h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-muted-foreground">Jogos para: {pageDate}</p>
            {apiMeta && (
              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                <Trophy className="h-3 w-3 mr-1" />
                SportMonks
              </Badge>
            )}
          </div>
        </div>
      </div>



      {errorFetching && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 text-destructive-foreground">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-semibold">Erro ao Carregar Jogos</AlertTitle>
          <AlertDescription>{errorFetching}</AlertDescription>
        </Alert>
      )}

      {!errorFetching && fixtures.length === 0 && (
        <Alert className="bg-card border border-border shadow-sm">
          <CalendarX className="h-5 w-5 text-muted-foreground" />
          <AlertTitle className="font-semibold text-foreground">Nenhum jogo encontrado!</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Não há jogos agendados para hoje ({today}) ou não foi possível carregá-los da SportMonks API.
          </AlertDescription>
        </Alert>
      )}

      {!errorFetching && fixtures.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {fixtures.map((fixture: any) => (
            <SportmonksPredictionCard key={fixture.id} fixture={fixture} />
          ))}
        </div>
      )}
    </div>
  )
}
