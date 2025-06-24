"use client"

import { useEffect, useState, useCallback } from "react"
import type { LiveScoreFixture } from "./types"
import { LiveGameCard } from "@/components/live/live-game-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, WifiOff, ListChecks, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLiveScores } from "@/hooks/use-real-time-updates"

export default function AoVivoPage() {
  // Use the real-time hook for live scores
  const { 
    data: liveScoresData, 
    loading, 
    error, 
    status,
    manualRefresh 
  } = useLiveScores()

  // Process the live scores data
  const liveScores = liveScoresData?.data ? 
    Array.isArray(liveScoresData.data) ? liveScoresData.data.sort(
      (a: any, b: any) =>
        a.league_id - b.league_id || new Date(a.starting_at).getTime() - new Date(b.starting_at).getTime(),
    ) : []
    : []

  const lastUpdated = status.lastUpdated

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
          <Button onClick={manualRefresh} variant="link" className="mt-2 p-0 h-auto">
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
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Acompanhe as partidas em andamento em tempo real.</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                status.isUpdating ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
              }`} />
              <span>
                {status.isUpdating ? 'Atualizando...' : 'Tempo Real'}
              </span>
              {lastUpdated && (
                <span className="text-xs">
                  (atualizado às {lastUpdated.toLocaleTimeString("pt-BR")})
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={manualRefresh} variant="outline" size="sm" disabled={status.isUpdating}>
            {status.isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
            Atualizar Agora
          </Button>
          <div className="text-xs text-muted-foreground">
            A cada 15s
          </div>
        </div>
      </div>

      {liveScores.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {liveScores.map((fixture: any) => (
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
