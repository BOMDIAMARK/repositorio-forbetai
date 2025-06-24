import { SportmonksPredictionCard } from "@/components/sportmonks-predictions/sportmonks-prediction-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CalendarX, AlertTriangle, Trophy } from "lucide-react"

// Buscar fixtures diretamente via SportMonks API
async function fetchFixtures(date: string) {
  try {
    // Para server-side fetch, usar URL absoluta baseada no ambiente
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
      
    const response = await fetch(`${baseUrl}/api/fixtures?date=${date}`, {
      next: { revalidate: 300 } // Cache por 5 minutos
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`)
    }
    
    const result = await response.json()
    return result
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

      {/* Status do SportMonks */}
      {apiMeta && (
        <Alert className="bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800">
          <Trophy className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900 dark:text-orange-100">SportMonks API Ativa</AlertTitle>
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            {fixtures.length > 0 
              ? `✅ ${fixtures.length} jogos carregados com sucesso via SportMonks`
              : '⏳ Aguardando dados da SportMonks API...'
            }
          </AlertDescription>
        </Alert>
      )}

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
