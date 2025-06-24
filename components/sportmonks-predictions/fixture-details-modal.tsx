"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import Image from "next/image"
import { processPredictions, getProbabilityColor, getProbabilityIcon } from "@/lib/predictions-processor"
import { calculateImpliedProbability } from "@/lib/odds-mapper"
import type { SportMonksFixture } from "@/app/(platform)/predicoes/types-sportmonks"

interface FixtureDetailsModalProps {
  fixture: SportMonksFixture
  isOpen: boolean
  onClose: () => void
}

interface FixtureDetails {
  processedOdds?: Record<string, unknown>
  predictions?: Record<string, unknown>[]
  h2h?: Record<string, unknown>
  teamForm?: Record<string, unknown>
}

export function FixtureDetailsModal({ fixture, isOpen, onClose }: FixtureDetailsModalProps) {
  const [details, setDetails] = useState<FixtureDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [isPredictionsExpanded, setIsPredictionsExpanded] = useState(false)
  const [isOddsExpanded, setIsOddsExpanded] = useState(false)

  useEffect(() => {
    if (!isOpen || !fixture.id) return

    const fetchDetails = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/sportmonks/enriched/${fixture.id}`)
        if (response.ok) {
          const data = await response.json()
          setDetails(data)
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [isOpen, fixture.id])

  // Parse participants to get team information
  const homeTeam = fixture.participants?.find((p) => p.meta?.location === "home")
  const awayTeam = fixture.participants?.find((p) => p.meta?.location === "away")

  // Format date and time
  const matchDate = new Date(fixture.starting_at)
  const isValidDate = !isNaN(matchDate.getTime())

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get league name - ensure it's always a string
  const leagueName = (() => {
    const leagueData = fixture.league?.data?.name
    const leagueDirectName = (fixture.league as Record<string, unknown>)?.name
    
    if (typeof leagueData === 'string') return leagueData
    if (typeof leagueDirectName === 'string') return leagueDirectName
    return "Liga Desconhecida"
  })()

     // Team Logo Component
   const TeamLogo = ({ team, size = 50 }: { team: { name?: string; image_path?: string } | undefined; size?: number }) => {
    const [imageError, setImageError] = useState(false)
    
    if (!team?.image_path || imageError) {
      return (
        <div 
          className="bg-muted dark:bg-gray-700 rounded-full flex items-center justify-center border"
          style={{ width: size, height: size }}
        >
                     <span className="text-xs font-bold text-foreground">
             {team?.name?.substring(0, 2).toUpperCase() || "??"}
           </span>
        </div>
      )
    }

    return (
      <div className="rounded-full overflow-hidden border" style={{ width: size, height: size }}>
                 <Image 
           src={team.image_path} 
           alt={team.name || "Team logo"}
           width={size}
           height={size}
           className="w-full h-full object-cover"
           onError={() => setImageError(true)}
         />
      </div>
    )
  }

  // Utility functions
  const formatOdd = (odd: number) => {
    return odd ? odd.toFixed(2) : '-.--'
  }

  const getOddColor = (odd: number) => {
    if (odd >= 3.0) return 'text-green-600 dark:text-green-400'
    if (odd >= 2.0) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  // Gera predições a partir das odds
  const predictions = details?.processedOdds ? processPredictions(details.processedOdds as Record<string, unknown>) : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            Análise Detalhada da Partida
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header da partida */}
          <div className="text-center space-y-4">
            <Badge variant="outline" className="mx-auto">
              {leagueName}
            </Badge>
            
            <div className="flex items-center justify-center space-x-6">
              <div className="text-center">
                <TeamLogo team={homeTeam} />
                <p className="mt-2 font-semibold">{homeTeam?.name || "Casa"}</p>
                <p className="text-sm text-muted-foreground">Casa</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground mb-2">VS</div>
                <p className="text-sm text-muted-foreground">
                  {isValidDate ? formatDateTime(matchDate) : "Data/Hora indisponível"}
                </p>
              </div>
              
              <div className="text-center">
                <TeamLogo team={awayTeam} />
                <p className="mt-2 font-semibold">{awayTeam?.name || "Visitante"}</p>
                <p className="text-sm text-muted-foreground">Visitante</p>
              </div>
            </div>
          </div>

          <Separator />

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Carregando análise detalhada...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Predições Inteligentes */}
              {predictions && (
                <Collapsible open={isPredictionsExpanded} onOpenChange={setIsPredictionsExpanded}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        🧠 Predições Inteligentes (IA)
                      </span>
                      {isPredictionsExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-4">
                    {/* Resultado Final */}
                    {predictions.fullTimeResult && (
                      <div className="bg-card border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 text-center">🏆 Resultado Final</h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">
                              {getProbabilityIcon(predictions.fullTimeResult.home.probability)} Casa
                            </div>
                            <div className={`text-lg font-bold ${getProbabilityColor(predictions.fullTimeResult.home.probability)}`}>
                              {predictions.fullTimeResult.home.probability}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {predictions.fullTimeResult.home.description}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">
                              {getProbabilityIcon(predictions.fullTimeResult.draw.probability)} Empate
                            </div>
                            <div className={`text-lg font-bold ${getProbabilityColor(predictions.fullTimeResult.draw.probability)}`}>
                              {predictions.fullTimeResult.draw.probability}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {predictions.fullTimeResult.draw.description}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">
                              {getProbabilityIcon(predictions.fullTimeResult.away.probability)} Visitante
                            </div>
                            <div className={`text-lg font-bold ${getProbabilityColor(predictions.fullTimeResult.away.probability)}`}>
                              {predictions.fullTimeResult.away.probability}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {predictions.fullTimeResult.away.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ambas Marcam */}
                    {predictions.bothTeamsToScore && (
                      <div className="bg-card border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 text-center">⚽ Ambas as Equipes Marcam</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">
                              {getProbabilityIcon(predictions.bothTeamsToScore.yes.probability)} Sim
                            </div>
                            <div className={`text-lg font-bold ${getProbabilityColor(predictions.bothTeamsToScore.yes.probability)}`}>
                              {predictions.bothTeamsToScore.yes.probability}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {predictions.bothTeamsToScore.yes.description}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">
                              {getProbabilityIcon(predictions.bothTeamsToScore.no.probability)} Não
                            </div>
                            <div className={`text-lg font-bold ${getProbabilityColor(predictions.bothTeamsToScore.no.probability)}`}>
                              {predictions.bothTeamsToScore.no.probability}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {predictions.bothTeamsToScore.no.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Total de Gols */}
                    {predictions.totalGoals && (
                      <div className="bg-card border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 text-center">🎯 Total de Gols</h4>
                        <div className="space-y-3">
                          {predictions.totalGoals.over25.probability > 0 && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="text-center p-2 bg-muted rounded">
                                <div className="text-xs text-muted-foreground mb-1">
                                  {getProbabilityIcon(predictions.totalGoals.over25.probability)} Mais de 2.5
                                </div>
                                <div className={`font-bold ${getProbabilityColor(predictions.totalGoals.over25.probability)}`}>
                                  {predictions.totalGoals.over25.probability}%
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {predictions.totalGoals.over25.description}
                                </div>
                              </div>
                              <div className="text-center p-2 bg-muted rounded">
                                <div className="text-xs text-muted-foreground mb-1">
                                  {getProbabilityIcon(predictions.totalGoals.under25.probability)} Menos de 2.5
                                </div>
                                <div className={`font-bold ${getProbabilityColor(predictions.totalGoals.under25.probability)}`}>
                                  {predictions.totalGoals.under25.probability}%
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {predictions.totalGoals.under25.description}
                                </div>
                              </div>
                            </div>
                          )}
                          {predictions.totalGoals.over15.probability > 0 && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="text-center p-2 bg-muted rounded">
                                <div className="text-xs text-muted-foreground mb-1">
                                  {getProbabilityIcon(predictions.totalGoals.over15.probability)} Mais de 1.5
                                </div>
                                <div className={`font-bold ${getProbabilityColor(predictions.totalGoals.over15.probability)}`}>
                                  {predictions.totalGoals.over15.probability}%
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {predictions.totalGoals.over15.description}
                                </div>
                              </div>
                              <div className="text-center p-2 bg-muted rounded">
                                <div className="text-xs text-muted-foreground mb-1">
                                  {getProbabilityIcon(predictions.totalGoals.under15.probability)} Menos de 1.5
                                </div>
                                <div className={`font-bold ${getProbabilityColor(predictions.totalGoals.under15.probability)}`}>
                                  {predictions.totalGoals.under15.probability}%
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {predictions.totalGoals.under15.description}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Placar Correto */}
                    {predictions.correctScore && predictions.correctScore.length > 0 && (
                      <div className="bg-card border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 text-center">🔢 Placar Mais Provável</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {predictions.correctScore.slice(0, 6).map((score, index) => (
                            <div key={index} className="text-center p-2 bg-muted rounded">
                              <div className="text-xs font-medium">{score.score}</div>
                              <div className={`text-sm font-bold ${getProbabilityColor(score.probability)}`}>
                                {score.probability}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {getProbabilityIcon(score.probability)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-center text-xs text-muted-foreground">
                      🧠 Probabilidades calculadas com base nas odds da SportMonks
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Odds Reais */}
              {details?.processedOdds && (
                <Collapsible open={isOddsExpanded} onOpenChange={setIsOddsExpanded}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        💰 Odds e Probabilidades
                      </span>
                      {isOddsExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-4">
                    {/* Resultado Final */}
                    {(details.processedOdds as Record<string, Record<string, number>>).fullTimeResult && (
                      <div className="bg-card border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 text-center">🏆 Resultado Final</h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Casa</div>
                            <div className={`text-lg font-bold ${getOddColor((details.processedOdds as Record<string, Record<string, number>>).fullTimeResult.home)}`}>
                              {formatOdd((details.processedOdds as Record<string, Record<string, number>>).fullTimeResult.home)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {calculateImpliedProbability((details.processedOdds as Record<string, Record<string, number>>).fullTimeResult.home)}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Empate</div>
                            <div className={`text-lg font-bold ${getOddColor((details.processedOdds as Record<string, Record<string, number>>).fullTimeResult.draw)}`}>
                              {formatOdd((details.processedOdds as Record<string, Record<string, number>>).fullTimeResult.draw)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {calculateImpliedProbability((details.processedOdds as Record<string, Record<string, number>>).fullTimeResult.draw)}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Visitante</div>
                            <div className={`text-lg font-bold ${getOddColor((details.processedOdds as Record<string, Record<string, number>>).fullTimeResult.away)}`}>
                              {formatOdd((details.processedOdds as Record<string, Record<string, number>>).fullTimeResult.away)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {calculateImpliedProbability((details.processedOdds as Record<string, Record<string, number>>).fullTimeResult.away)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ambas Marcam */}
                    {(details.processedOdds as Record<string, Record<string, number>>).bothTeamsToScore && (
                      <div className="bg-card border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 text-center">⚽ Ambas as Equipes Marcam</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Sim</div>
                            <div className={`text-lg font-bold ${getOddColor((details.processedOdds as Record<string, Record<string, number>>).bothTeamsToScore.yes)}`}>
                              {formatOdd((details.processedOdds as Record<string, Record<string, number>>).bothTeamsToScore.yes)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {calculateImpliedProbability((details.processedOdds as Record<string, Record<string, number>>).bothTeamsToScore.yes)}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Não</div>
                            <div className={`text-lg font-bold ${getOddColor((details.processedOdds as Record<string, Record<string, number>>).bothTeamsToScore.no)}`}>
                              {formatOdd((details.processedOdds as Record<string, Record<string, number>>).bothTeamsToScore.no)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {calculateImpliedProbability((details.processedOdds as Record<string, Record<string, number>>).bothTeamsToScore.no)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Total de Gols */}
                    {(details.processedOdds as Record<string, Record<string, number>>).totalGoals && (
                      <div className="bg-card border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 text-center">🎯 Total de Gols</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Mais de 2.5</div>
                            <div className={`text-lg font-bold ${getOddColor((details.processedOdds as Record<string, Record<string, number>>).totalGoals.over25)}`}>
                              {formatOdd((details.processedOdds as Record<string, Record<string, number>>).totalGoals.over25)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {calculateImpliedProbability((details.processedOdds as Record<string, Record<string, number>>).totalGoals.over25)}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Menos de 2.5</div>
                            <div className={`text-lg font-bold ${getOddColor((details.processedOdds as Record<string, Record<string, number>>).totalGoals.under25)}`}>
                              {formatOdd((details.processedOdds as Record<string, Record<string, number>>).totalGoals.under25)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {calculateImpliedProbability((details.processedOdds as Record<string, Record<string, number>>).totalGoals.under25)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-center text-xs text-muted-foreground">
                      💰 Odds fornecidas pela SportMonks API
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
