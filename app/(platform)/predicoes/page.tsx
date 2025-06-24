import { SportmonksPredictionCard } from "@/components/sportmonks-predictions/sportmonks-prediction-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CalendarX, AlertTriangle, Zap, DollarSign } from "lucide-react" // Changed icon to CalendarX for "no games"

// Usar o novo sistema multi-API
async function fetchFixturesMultiAPI(date: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/fixtures?date=${date}`, {
      next: { revalidate: 300 } // Cache por 5 minutos
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Erro no fetch multi-API:', error)
    throw error
  }
}

export default async function PredictionsPageSportmonks() {
  const today = new Date().toISOString().slice(0, 10)
  let fixtures = []
  let errorFetching: string | null = null
  let apiMeta: any = null

  try {
    const result = await fetchFixturesMultiAPI(today)
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

  // Função para determinar cor do provider
  const getProviderColor = (cost: string) => {
    switch (cost) {
      case 'free': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  // Função para obter ícone do provider
  const getProviderIcon = (cost: string) => {
    switch (cost) {
      case 'free': return <Zap className="h-3 w-3" />
      case 'low': return <DollarSign className="h-3 w-3" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Predições dos Jogos</h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-muted-foreground">Jogos para: {pageDate}</p>
            {apiMeta && apiMeta.providers && (
              <div className="flex gap-1">
                {apiMeta.providers.map((provider: any) => (
                  <Badge 
                    key={provider.name}
                    variant="outline" 
                    className={`text-xs ${getProviderColor(provider.cost)} ${provider.available ? '' : 'opacity-50'}`}
                  >
                    {getProviderIcon(provider.cost)}
                    {provider.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status do Sistema Multi-API */}
      {apiMeta && (
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <Zap className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900 dark:text-blue-100">Sistema Multi-API Ativo</AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            {fixtures.length > 0 
              ? `✅ ${fixtures.length} jogos carregados com sucesso de múltiplas fontes`
              : '⏳ Sistema em standby, aguardando dados...'
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
            Não há jogos agendados para hoje ({today}) ou não foi possível carregá-los de nenhuma fonte.
          </AlertDescription>
        </Alert>
      )}

      {!errorFetching && fixtures.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {fixtures.map((fixture) => (
            <SportmonksPredictionCard key={fixture.id || fixture._multiApi?.unifiedId} fixture={fixture} />
          ))}
        </div>
      )}
    </div>
  )
}
