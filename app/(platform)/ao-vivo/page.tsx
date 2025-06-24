"use client"

import { useEffect, useState, useCallback } from "react"
import type { LiveScoreFixture } from "./types"
import { LiveGameCard } from "@/components/live/live-game-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, WifiOff, ListChecks } from "lucide-react"
import { Button } from "@/components/ui/button"

const POLLING_INTERVAL = 30000 // 30 segundos

export default function AoVivoPage() {
  const [liveScores, setLiveScores] = useState<LiveScoreFixture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const getLiveScores = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/live-scores")
      if (!res.ok) throw new Error("Erro ao buscar jogos ao vivo.")
      const { data } = await res.json()
      const sortedData = data.sort(
        (a: any, b: any) =>
          a.league_id - b.league_id || new Date(a.starting_at).getTime() - new Date(b.starting_at).getTime(),
      )
      setLiveScores(sortedData)
      setLastUpdated(new Date())
    } catch (e: any) {
      setError(e.message || "Erro desconhecido.")
    } finally {
      if (isInitialLoad) setLoading(false)
    }
  }, [])

  useEffect(() => {
    getLiveScores(true) // Carga inicial

    const intervalId = setInterval(() => {
      getLiveScores()
    }, POLLING_INTERVAL)

    return () => clearInterval(intervalId) // Limpa o intervalo ao desmontar o componente
  }, [getLiveScores])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-forbet" />
        <p className="text-lg font-semibold">Carregando jogos ao vivo...</p>
        <p className="text-muted-foreground">Buscando as partidas em andamento.</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-lg mx-auto">
        <WifiOff className="h-5 w-5" />
        <AlertTitle>Erro de Conexão</AlertTitle>
        <AlertDescription>
          {error}
          <Button onClick={() => getLiveScores(true)} variant="link" className="mt-2 p-0 h-auto">
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Jogos Ao Vivo</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe as partidas em andamento em tempo real.
            {lastUpdated && ` Atualizado às ${lastUpdated.toLocaleTimeString("pt-BR")}.`}
          </p>
        </div>
        <Button onClick={() => getLiveScores(true)} variant="outline" size="sm" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ListChecks className="mr-2 h-4 w-4" />}
          Atualizar Agora
        </Button>
      </div>

      {liveScores.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {liveScores.map((fixture) => (
            <LiveGameCard key={fixture.id} fixture={fixture} />
          ))}
        </div>
      ) : (
        <Alert className="border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400">
          <ListChecks className="h-5 w-5 text-blue-500" />
          <AlertTitle className="font-semibold">Nenhum Jogo Ao Vivo</AlertTitle>
          <AlertDescription>
            No momento, não há jogos em andamento sendo monitorados pela plataforma. Verifique mais tarde!
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
