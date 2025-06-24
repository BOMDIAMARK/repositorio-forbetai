"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import type { SportMonksFixture, SportMonksFixtureDetails } from "@/app/(platform)/predicoes/types-sportmonks"
import { processStatistics, processScores, type ProcessedStatistic } from "@/lib/statistics-mapper"
import { formatOdd, calculateImpliedProbability, getOddColor } from "@/lib/odds-mapper"
import { processPredictions, getProbabilityColor, getProbabilityIcon, type PredictionData } from "@/lib/predictions-processor"

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
  const [isHomeStatsExpanded, setIsHomeStatsExpanded] = useState(false)
  const [isAwayStatsExpanded, setIsAwayStatsExpanded] = useState(false)
  const [isPredictionsExpanded, setIsPredictionsExpanded] = useState(false)
  const [isOddsExpanded, setIsOddsExpanded] = useState(false)
  const [isRawDataExpanded, setIsRawDataExpanded] = useState(false)

  useEffect(() => {
    if (isOpen && fixture) {
      fetchDetails()
    } else {
      // Reset state when modal closes
      setDetails(null)
      setError(null)
      setIsStatsExpanded(false)
      setIsHomeStatsExpanded(false)
      setIsAwayStatsExpanded(false)
      setIsPredictionsExpanded(false)
      setIsOddsExpanded(false)
      setIsRawDataExpanded(false)
    }
  }, [isOpen, fixture])

  const fetchDetails = async () => {
    if (!fixture) return

    setLoading(true)
    setError(null)

    try {
      // Usar originalId se disponível (para fixtures do multi-API), senão usar id
      const fixtureId = (fixture as any).originalId || fixture.id
      console.log(`🔍 Buscando detalhes para fixture: ${fixtureId} (original: ${fixture.id})`)
      const res = await fetch(`/api/sportmonks/fixtures/${fixtureId}`)
      
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

  // Obter nomes e informações dos times
  const homeTeam = participantsArray.find((p: any) => p.meta?.location === "home")
  const awayTeam = participantsArray.find((p: any) => p.meta?.location === "away")

  const homeTeamName = homeTeam?.name || "Casa"
  const awayTeamName = awayTeam?.name || "Fora"
  const homeTeamImage = homeTeam?.image_path
  const awayTeamImage = awayTeam?.image_path

  // Processar predições baseadas nas odds
  const predictions: PredictionData = details?.processedOdds 
    ? processPredictions(details.processedOdds)
    : {}

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                {homeTeamImage ? (
                  <img 
                    src={homeTeamImage} 
                    alt={homeTeamName}
                    className="w-6 h-6 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <span className={`text-xs font-bold ${homeTeamImage ? 'hidden' : ''}`}>
                  {homeTeamName.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <span>{homeTeamName}</span>
            </div>
            <span>vs</span>
            <div className="flex items-center space-x-2">
              <span>{awayTeamName}</span>
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                {awayTeamImage ? (
                  <img 
                    src={awayTeamImage} 
                    alt={awayTeamName}
                    className="w-6 h-6 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <span className={`text-xs font-bold ${awayTeamImage ? 'hidden' : ''}`}>
                  {awayTeamName.substring(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            🎯 Predições, estatísticas e odds reais da partida
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
            {/* Placar com Times */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                    {homeTeamImage ? (
                      <img 
                        src={homeTeamImage} 
                        alt={homeTeamName}
                        className="w-10 h-10 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <span className={`text-xs font-bold ${homeTeamImage ? 'hidden' : ''}`}>
                      {homeTeamName.substring(0, 3).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{homeTeamName}</p>
                </div>

                <div className="text-3xl font-bold">
                  {scores.home} - {scores.away}
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                    {awayTeamImage ? (
                      <img 
                        src={awayTeamImage} 
                        alt={awayTeamName}
                        className="w-10 h-10 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <span className={`text-xs font-bold ${awayTeamImage ? 'hidden' : ''}`}>
                      {awayTeamName.substring(0, 3).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{awayTeamName}</p>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
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
            <Collapsible open={isHomeStatsExpanded} onOpenChange={setIsHomeStatsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>📊 Estatísticas Completas - {homeTeamName}</span>
                  {isHomeStatsExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center overflow-hidden">
                      {homeTeamImage ? (
                        <img 
                          src={homeTeamImage} 
                          alt={homeTeamName}
                          className="w-6 h-6 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <span className={`text-xs font-bold ${homeTeamImage ? 'hidden' : ''}`}>
                        {homeTeamName.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <h5 className="font-semibold">{homeTeamName}</h5>
                  </div>
                  
                  {statisticsArray.filter((stat: any) => stat.participant_id === homeTeam?.id).length > 0 ? (
                    <div className="space-y-3">
                      {statisticsArray
                        .filter((stat: any) => stat.participant_id === homeTeam?.id)
                        .map((stat: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-background rounded-lg border">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm font-medium">Tipo {stat.type_id}</span>
                            </div>
                            <span className="font-bold text-lg">{stat.data?.value ?? "N/A"}</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-muted-foreground">
                        Estatísticas não disponíveis para {homeTeamName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Dados podem não estar disponíveis para jogos futuros
                      </p>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={isAwayStatsExpanded} onOpenChange={setIsAwayStatsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>📊 Estatísticas Completas - {awayTeamName}</span>
                  {isAwayStatsExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center overflow-hidden">
                      {awayTeamImage ? (
                        <img 
                          src={awayTeamImage} 
                          alt={awayTeamName}
                          className="w-6 h-6 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <span className={`text-xs font-bold ${awayTeamImage ? 'hidden' : ''}`}>
                        {awayTeamName.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <h5 className="font-semibold">{awayTeamName}</h5>
                  </div>
                  
                  {statisticsArray.filter((stat: any) => stat.participant_id === awayTeam?.id).length > 0 ? (
                    <div className="space-y-3">
                      {statisticsArray
                        .filter((stat: any) => stat.participant_id === awayTeam?.id)
                        .map((stat: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-background rounded-lg border">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-sm font-medium">Tipo {stat.type_id}</span>
                            </div>
                            <span className="font-bold text-lg">{stat.data?.value ?? "N/A"}</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-muted-foreground">
                        Estatísticas não disponíveis para {awayTeamName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Dados podem não estar disponíveis para jogos futuros
                      </p>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Predições Intuitivas */}
            {(predictions.fullTimeResult || predictions.bothTeamsToScore || predictions.totalGoals) && (
              <Collapsible open={isPredictionsExpanded} onOpenChange={setIsPredictionsExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span>🎯 Predições e Probabilidades</span>
                    {isPredictionsExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    
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
                              {getProbabilityIcon(predictions.fullTimeResult.away.probability)} Fora
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
                                  {getProbabilityIcon(predictions.totalGoals.over25.probability)} Over 2.5
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
                                  {getProbabilityIcon(predictions.totalGoals.under25.probability)} Under 2.5
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
                                  {getProbabilityIcon(predictions.totalGoals.over15.probability)} Over 1.5
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
                                  {getProbabilityIcon(predictions.totalGoals.under15.probability)} Under 1.5
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
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Odds Reais */}
            {details.processedOdds && (
              <Collapsible open={isOddsExpanded} onOpenChange={setIsOddsExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span>💰 Odds Reais (SportMonks)</span>
                    {isOddsExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    
                    {/* Resultado Final (1X2) */}
                    {details.processedOdds.fullTimeResult && (
                      <div className="bg-card border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 text-center">🏆 Resultado Final</h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Casa</div>
                            <div className={`text-lg font-bold ${getOddColor(details.processedOdds.fullTimeResult.home)}`}>
                              {formatOdd(details.processedOdds.fullTimeResult.home)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {calculateImpliedProbability(details.processedOdds.fullTimeResult.home)}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Empate</div>
                            <div className={`text-lg font-bold ${getOddColor(details.processedOdds.fullTimeResult.draw)}`}>
                              {formatOdd(details.processedOdds.fullTimeResult.draw)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {calculateImpliedProbability(details.processedOdds.fullTimeResult.draw)}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Fora</div>
                            <div className={`text-lg font-bold ${getOddColor(details.processedOdds.fullTimeResult.away)}`}>
                              {formatOdd(details.processedOdds.fullTimeResult.away)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {calculateImpliedProbability(details.processedOdds.fullTimeResult.away)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ambas Marcam */}
                    {details.processedOdds.bothTeamsToScore && (
                      <div className="bg-card border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 text-center">⚽ Ambas as Equipes Marcam</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Sim</div>
                            <div className={`text-lg font-bold ${getOddColor(details.processedOdds.bothTeamsToScore.yes)}`}>
                              {formatOdd(details.processedOdds.bothTeamsToScore.yes)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {calculateImpliedProbability(details.processedOdds.bothTeamsToScore.yes)}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-muted rounded-lg">
                            <div className="text-xs text-muted-foreground mb-1">Não</div>
                            <div className={`text-lg font-bold ${getOddColor(details.processedOdds.bothTeamsToScore.no)}`}>
                              {formatOdd(details.processedOdds.bothTeamsToScore.no)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {calculateImpliedProbability(details.processedOdds.bothTeamsToScore.no)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Total de Gols */}
                    {details.processedOdds.totalGoals && (
                      <div className="bg-card border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 text-center">🎯 Total de Gols</h4>
                        <div className="space-y-3">
                          {details.processedOdds.totalGoals.over25 > 0 && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="text-center p-2 bg-muted rounded">
                                <div className="text-xs text-muted-foreground">Over 2.5</div>
                                <div className={`font-bold ${getOddColor(details.processedOdds.totalGoals.over25)}`}>
                                  {formatOdd(details.processedOdds.totalGoals.over25)}
                                </div>
                              </div>
                              <div className="text-center p-2 bg-muted rounded">
                                <div className="text-xs text-muted-foreground">Under 2.5</div>
                                <div className={`font-bold ${getOddColor(details.processedOdds.totalGoals.under25)}`}>
                                  {formatOdd(details.processedOdds.totalGoals.under25)}
                                </div>
                              </div>
                            </div>
                          )}
                          {details.processedOdds.totalGoals.over15 > 0 && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="text-center p-2 bg-muted rounded">
                                <div className="text-xs text-muted-foreground">Over 1.5</div>
                                <div className={`font-bold ${getOddColor(details.processedOdds.totalGoals.over15)}`}>
                                  {formatOdd(details.processedOdds.totalGoals.over15)}
                                </div>
                              </div>
                              <div className="text-center p-2 bg-muted rounded">
                                <div className="text-xs text-muted-foreground">Under 1.5</div>
                                <div className={`font-bold ${getOddColor(details.processedOdds.totalGoals.under15)}`}>
                                  {formatOdd(details.processedOdds.totalGoals.under15)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Placar Correto */}
                    {details.processedOdds.correctScore && details.processedOdds.correctScore.length > 0 && (
                      <div className="bg-card border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 text-center">🔢 Placar Correto (Top 6)</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {details.processedOdds.correctScore.slice(0, 6).map((score, index) => (
                            <div key={index} className="text-center p-2 bg-muted rounded">
                              <div className="text-xs font-medium">{score.score}</div>
                              <div className={`text-sm font-bold ${getOddColor(score.odd)}`}>
                                {formatOdd(score.odd)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Handicap Asiático */}
                    {details.processedOdds.asianHandicap && details.processedOdds.asianHandicap.length > 0 && (
                      <div className="bg-card border rounded-lg p-4">
                        <h4 className="font-semibold mb-3 text-center">🏃 Handicap Asiático</h4>
                        <div className="space-y-2">
                          {details.processedOdds.asianHandicap.slice(0, 3).map((handicap, index) => (
                            <div key={index} className="grid grid-cols-3 gap-3 text-center">
                              <div className="p-2 bg-muted rounded">
                                <div className="text-xs text-muted-foreground">Casa ({handicap.handicap})</div>
                                <div className={`font-bold ${getOddColor(handicap.home)}`}>
                                  {formatOdd(handicap.home)}
                                </div>
                              </div>
                              <div className="p-2 bg-muted rounded flex items-center justify-center">
                                <div className="text-xs font-medium">{handicap.handicap}</div>
                              </div>
                              <div className="p-2 bg-muted rounded">
                                <div className="text-xs text-muted-foreground">Fora ({handicap.handicap})</div>
                                <div className={`font-bold ${getOddColor(handicap.away)}`}>
                                  {formatOdd(handicap.away)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-center text-xs text-muted-foreground">
                      💡 Odds mostram os melhores valores encontrados entre todas as casas de apostas disponíveis
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

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
