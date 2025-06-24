import { fetchFixturesByDate } from "@/lib/sportmonks-api-client"
import { SportmonksPredictionCard } from "@/components/sportmonks-predictions/sportmonks-prediction-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CalendarX, AlertTriangle } from "lucide-react" // Changed icon to CalendarX for "no games"

export default async function PredictionsPageSportmonks() {
  const today = new Date().toISOString().slice(0, 10)
  let fixtures = []
  let errorFetching: string | null = null

  try {
    fixtures = await fetchFixturesByDate(today)
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
        <h1 className="text-3xl font-bold tracking-tight">Predições dos Jogos</h1>
      </div>
      <p className="text-muted-foreground">Jogos para: {pageDate} (Fonte: SportMonks API)</p>

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
            Não há jogos agendados para hoje ({today}) ou não foi possível carregá-los.
          </AlertDescription>
        </Alert>
      )}

      {!errorFetching && fixtures.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {fixtures.map((fixture) => (
            <SportmonksPredictionCard key={fixture.id} fixture={fixture} />
          ))}
        </div>
      )}
    </div>
  )
}
