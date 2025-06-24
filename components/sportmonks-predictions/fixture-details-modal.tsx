"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import type { SportMonksFixture, SportMonksFixtureDetails } from "@/app/(platform)/predicoes/types-sportmonks"
import { processStatistics, processScores, type ProcessedStatistic } from "@/lib/statistics-mapper"

interface FixtureDetailsModalProps {
  fixture: SportMonksFixture | null
  isOpen: boolean
  onClose: () => void
}

export function FixtureDetailsModal({ fixture, isOpen, onClose }: FixtureDetailsModalProps) {
  const [details, setDetails] = useState<SportMonksFixtureDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isStatsExpanded, setIsStatsExpanded] = useState(false)
  const [isGoiasStatsExpanded, setIsGoiasStatsExpanded] = useState(false)
  const [isAthleticStatsExpanded, setIsAthleticStatsExpanded] = useState(false)
  const [isRawDataExpanded, setIsRawDataExpanded] = useState(false)

  useEffect(() => {
    if (isOpen && fixture) {
      fetchDetails()
    } else {
      // Reset state when modal closes
      setDetails(null)
      setError(null)
      setIsStatsExpanded(false)
      setIsGoiasStatsExpanded(false)
      setIsAthleticStatsExpanded(false)
      setIsRawDataExpanded(false)
    }
  }, [isOpen, fixture])

  const fetchDetails = async () => {
    if (!fixture) return

    setLoading(true)
    setError(null)

    try {
      console.log(`🔍 Buscando detalhes para fixture: ${fixture.id}`)
      const res = await fetch(`/api/sportmonks/fixtures/${fixture.id}`)
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || `Erro ${res.status}: ${res.statusText}`)
      }

      const data: SportMonksFixtureDetails = await res.json()
      console.log(`✅ Detalhes recebidos:`, data)
      setDetails(data)
    } catch (error: any) {
      console.error(`❌ Erro ao buscar detalhes:`, error)
      setError(error.message || "Erro ao carregar detalhes do jogo.")
    } finally {
      setLoading(false)
    }
  }

  if (!fixture) return null

  // Processar dados se disponíveis
  const statisticsArray = Array.isArray(details?.statistics) 
    ? details.statistics 
    : (details?.statistics as any)?.data || []
  
  const participantsArray = Array.isArray(details?.participants) 
    ? details.participants 
    : (details?.participants as any)?.data || []
  
  const scoresArray = Array.isArray(details?.scores) 
    ? details.scores 
    : (details?.scores as any)?.data || []
  
  const processedStats: ProcessedStatistic[] = statisticsArray.length > 0 && participantsArray.length > 0
    ? processStatistics(statisticsArray, participantsArray)
    : []

  const scores = scoresArray.length > 0 ? processScores(scoresArray) : { home: 0, away: 0 }

  // Obter nomes dos times
  const homeTeam = participantsArray.find((p: any) => p.meta?.location === "home")
  const awayTeam = participantsArray.find((p: any) => p.meta?.location === "away")

  const homeTeamName = homeTeam?.name || "Casa"
  const awayTeamName = awayTeam?.name || "Fora"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Detalhes: {fixture.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Estatísticas detalhadas da partida.
          </p>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando detalhes...</span>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive-foreground p-4 rounded-md">
            <p className="font-semibold">Erro ao carregar detalhes</p>
            <p className="text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchDetails}
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {details && !loading && (
          <div className="space-y-6">
            {/* Placar */}
            <div className="text-center">
              <div className="text-3xl font-bold">
                {scores.home} - {scores.away}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {details.state?.name || "Status não disponível"}
              </div>
            </div>

            {/* Estatísticas da Partida */}
            {processedStats.length > 0 && (
              <div className="bg-card border rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center font-semibold border-b pb-2 mb-4">
                  <div>{homeTeamName}</div>
                  <div>Estatística</div>
                  <div>{awayTeamName}</div>
                </div>

                <div className="space-y-3">
                  {processedStats.map((stat, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 text-center py-2 border-b border-border/50 last:border-b-0">
                      <div className="font-medium">{stat.homeValue}</div>
                      <div className="text-sm text-muted-foreground">{stat.name}</div>
                      <div className="font-medium">{stat.awayValue}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estatísticas Completas por Time */}
            <Collapsible open={isGoiasStatsExpanded} onOpenChange={setIsGoiasStatsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>Estatísticas Completas - {homeTeamName}</span>
                  {isGoiasStatsExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                <div className="bg-muted p-4 rounded-md">
                  {statisticsArray.filter((stat: any) => stat.participant_id === homeTeam?.id).length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {statisticsArray
                        .filter((stat: any) => stat.participant_id === homeTeam?.id)
                        .map((stat: any, index: number) => (
                          <div key={index} className="flex justify-between">
                            <span>Tipo {stat.type_id}:</span>
                            <span className="font-medium">{stat.data?.value ?? "N/A"}</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nenhuma estatística de {homeTeamName} disponível.</p>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={isAthleticStatsExpanded} onOpenChange={setIsAthleticStatsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>Estatísticas Completas - {awayTeamName}</span>
                  {isAthleticStatsExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                <div className="bg-muted p-4 rounded-md">
                  {statisticsArray.filter((stat: any) => stat.participant_id === awayTeam?.id).length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {statisticsArray
                        .filter((stat: any) => stat.participant_id === awayTeam?.id)
                        .map((stat: any, index: number) => (
                          <div key={index} className="flex justify-between">
                            <span>Tipo {stat.type_id}:</span>
                            <span className="font-medium">{stat.data?.value ?? "N/A"}</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nenhuma estatística de {awayTeamName} disponível.</p>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Dados Brutos (JSON) */}
            <Collapsible open={isRawDataExpanded} onOpenChange={setIsRawDataExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>Dados Brutos (JSON)</span>
                  {isRawDataExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-black text-green-400 p-4 rounded-md font-mono text-xs overflow-auto max-h-96">
                  <pre>{JSON.stringify(details, null, 2)}</pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
