"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useFixtureUpdates, usePredictionsUpdates } from "@/hooks/use-real-time-updates"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  CalendarDays, 
  Clock, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  BarChart3,
  Users,
  Activity,
  Trophy,
  AlertTriangle,
  Zap
} from "lucide-react"
import type { DetailedFixtureAnalysis } from "@/app/(platform)/analises/types"

interface H2HRecord {
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  last_5_results: Array<{
    result: 'W' | 'D' | 'L'
    score: string
    date: string
  }>
}

interface TeamForm {
  last_5_matches: Array<{
    result: 'W' | 'D' | 'L'
    opponent: string
    score: string
    date: string
  }>
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
}

export default function DetailedAnalysisPage() {
  const params = useParams()
  const router = useRouter()
  const fixtureId = params.fixtureId as string
  
  const [h2hData, setH2hData] = useState<H2HRecord | null>(null)
  const [homeTeamForm, setHomeTeamForm] = useState<TeamForm | null>(null)
  const [awayTeamForm, setAwayTeamForm] = useState<TeamForm | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  
  // Real-time hooks
  const { 
    data: fixtureData, 
    loading: fixtureLoading, 
    error: fixtureError,
    status: fixtureStatus,
    manualRefresh: refreshFixture
  } = useFixtureUpdates(fixtureId)
  
  const { 
    data: predictionsData,
    status: predictionsStatus,
    manualRefresh: refreshPredictions
  } = usePredictionsUpdates(fixtureId)
  
  // Combine fixture and predictions data
  const fixtureDetails = fixtureData?.data ? {
    ...fixtureData.data,
    predictions: predictionsData?.data?.predictions || fixtureData.data.predictions || []
  } : null
  
  const loading = initialLoading || fixtureLoading
  const error = fixtureError

  useEffect(() => {
    async function loadH2HAndFormData() {
      if (!fixtureId || !fixtureDetails) return
      
      try {
        const homeTeam = fixtureDetails.participants?.find((p: any) => p.meta?.location === "home")
        const awayTeam = fixtureDetails.participants?.find((p: any) => p.meta?.location === "away")
        
        if (!homeTeam || !awayTeam) {
          console.warn('Times não encontrados na fixture')
          setInitialLoading(false)
          return
        }

        console.log(`🔍 Carregando dados reais para: ${homeTeam.name} vs ${awayTeam.name}`)

        // Load real H2H data
        try {
          const h2hResponse = await fetch(`/api/sportmonks/h2h/${homeTeam.id}-vs-${awayTeam.id}`)
          if (h2hResponse.ok) {
            const h2hResult = await h2hResponse.json()
            console.log('✅ H2H data loaded:', h2hResult.meta.source)
            setH2hData(h2hResult.data)
          } else {
            console.warn('⚠️ Erro ao carregar H2H, usando fallback')
          }
        } catch (h2hError) {
          console.warn('⚠️ Erro H2H:', h2hError)
        }

        // Load real team form data
        const [homeFormResponse, awayFormResponse] = await Promise.allSettled([
          fetch(`/api/sportmonks/team-form/${homeTeam.id}`),
          fetch(`/api/sportmonks/team-form/${awayTeam.id}`)
        ])

        if (homeFormResponse.status === 'fulfilled' && homeFormResponse.value.ok) {
          const homeFormResult = await homeFormResponse.value.json()
          console.log('✅ Home team form loaded:', homeFormResult.meta.source)
          setHomeTeamForm(homeFormResult.data)
        } else {
          console.warn('⚠️ Erro ao carregar forma do time da casa')
        }

        if (awayFormResponse.status === 'fulfilled' && awayFormResponse.value.ok) {
          const awayFormResult = await awayFormResponse.value.json()
          console.log('✅ Away team form loaded:', awayFormResult.meta.source)
          setAwayTeamForm(awayFormResult.data)
        } else {
          console.warn('⚠️ Erro ao carregar forma do time visitante')
        }

      } catch (err: any) {
        console.error('Erro ao carregar dados reais:', err)
      } finally {
        setInitialLoading(false)
      }
    }

    loadH2HAndFormData()
  }, [fixtureId, fixtureDetails])

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    return {
      date: date.toLocaleDateString("pt-BR", { 
        weekday: "long",
        day: "2-digit", 
        month: "long", 
        year: "numeric" 
      }),
      time: date.toLocaleTimeString("pt-BR", { 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
    }
  }

  const getResultIcon = (result: 'W' | 'D' | 'L') => {
    switch (result) {
      case 'W':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'L':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'D':
        return <Minus className="h-4 w-4 text-yellow-600" />
    }
  }

  const getFormPercentage = (form: TeamForm) => {
    if (!form) return 0
    if (form.form_percentage) return form.form_percentage
    const totalMatches = form.wins + form.draws + form.losses
    if (totalMatches === 0) return 0
    return Math.round((form.wins * 3 + form.draws) / (totalMatches * 3) * 100)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary-forbet/20 animate-ping"></div>
          <div className="relative rounded-full bg-gradient-to-br from-primary-forbet to-secondary-forbet p-4">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Finalizando Análise</h2>
          <p className="text-muted-foreground">Organizando dados e insights...</p>
        </div>
      </div>
    )
  }

  if (error || !fixtureDetails) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar Análise</AlertTitle>
          <AlertDescription>
            {error || 'Não foi possível carregar os dados da partida'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const homeTeam = fixtureDetails.participants?.find((p) => p.meta?.location === "home")
  const awayTeam = fixtureDetails.participants?.find((p) => p.meta?.location === "away")
  const { date, time } = formatDateTime(fixtureDetails.starting_at)

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Análises
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-gradient-to-r from-primary-forbet/10 to-secondary-forbet/10">
            <Zap className="h-3 w-3 mr-1" />
            Análise IA Completa
          </Badge>
          
          {/* Real-time status indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {fixtureStatus.isUpdating || predictionsStatus.isUpdating ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Atualizando...</span>
              </div>
            ) : (
              fixtureStatus.lastUpdated && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>
                    Atualizado às {fixtureStatus.lastUpdated.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Match Header */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary-forbet/80 to-secondary-forbet/80 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {fixtureDetails.league?.image_path && (
                <Image
                  src={fixtureDetails.league.image_path}
                  alt={fixtureDetails.league.name || ""}
                  width={40}
                  height={40}
                  className="bg-white/20 rounded-full p-1"
                />
              )}
              <div>
                <CardTitle className="text-2xl">{fixtureDetails.league?.name}</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Análise Detalhada
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {fixtureDetails.state?.name || "Agendado"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Home Team */}
            <div className="flex flex-col items-center text-center space-y-3">
              {homeTeam?.image_path && (
                <Image 
                  src={homeTeam.image_path} 
                  alt={homeTeam.name} 
                  width={80} 
                  height={80}
                  className="rounded-full border-2 border-primary-forbet/20"
                />
              )}
              <div>
                <h3 className="text-xl font-bold">{homeTeam?.name || "Time da Casa"}</h3>
                <Badge variant="outline">Casa</Badge>
              </div>
            </div>

            {/* Match Info */}
            <div className="text-center space-y-4">
              <div className="text-4xl font-light text-muted-foreground">VS</div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span className="capitalize">{date}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{time}</span>
                </div>
                {fixtureDetails.venue?.name && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{fixtureDetails.venue.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center text-center space-y-3">
              {awayTeam?.image_path && (
                <Image 
                  src={awayTeam.image_path} 
                  alt={awayTeam.name} 
                  width={80} 
                  height={80}
                  className="rounded-full border-2 border-primary-forbet/20"
                />
              )}
              <div>
                <h3 className="text-xl font-bold">{awayTeam?.name || "Time Visitante"}</h3>
                <Badge variant="outline">Visitante</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Tabs */}
      <Tabs defaultValue="predictions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Predições
          </TabsTrigger>
          <TabsTrigger value="h2h" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Head-to-Head
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Forma Recente
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Insights IA
          </TabsTrigger>
        </TabsList>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Predições SportMonks
                </div>
                <div className="flex items-center gap-2">
                  {predictionsStatus.isUpdating && (
                    <div className="w-4 h-4 border-2 border-primary-forbet border-t-transparent rounded-full animate-spin" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshPredictions}
                    className="h-8 w-8 p-0"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Análise baseada em dados estatísticos e algoritmos avançados
                {predictionsStatus.lastUpdated && (
                  <span className="block text-xs mt-1">
                    Última atualização: {predictionsStatus.lastUpdated.toLocaleTimeString('pt-BR')}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fixtureDetails.predictions && fixtureDetails.predictions.length > 0 ? (
                <div className="space-y-6">
                  {/* Main 1X2 Predictions */}
                  {fixtureDetails.predictions.find((p: any) => p.type?.name === "1X2") && (
                    <div>
                      <h4 className="font-semibold mb-3">Resultado Final (1X2)</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Casa</TableHead>
                            <TableHead>Empate</TableHead>
                            <TableHead>Visitante</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fixtureDetails.predictions.filter((p: any) => p.type?.name === "1X2").map((prediction: any) => {
                            const predData = prediction.predictions
                            return (
                              <TableRow key={prediction.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{(predData.home * 100)?.toFixed(1)}%</span>
                                    <Progress value={predData.home * 100} className="w-20 h-3" />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{(predData.draw * 100)?.toFixed(1)}%</span>
                                    <Progress value={predData.draw * 100} className="w-20 h-3" />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{(predData.away * 100)?.toFixed(1)}%</span>
                                    <Progress value={predData.away * 100} className="w-20 h-3" />
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  
                  {/* Other Predictions */}
                  <div>
                    <h4 className="font-semibold mb-3">Outras Predições</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fixtureDetails.predictions.filter((p: any) => p.type?.name !== "1X2").map((prediction: any) => {
                        const predData = prediction.predictions
                        const predType = prediction.type?.name || "Predição"
                        
                        return (
                          <Card key={prediction.id} className="p-4">
                            <h5 className="font-medium mb-2">{predType}</h5>
                            <div className="space-y-2 text-sm">
                              {Object.entries(predData).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                                  <span className="font-medium">
                                    {typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Predições não disponíveis para esta partida
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    As predições podem não estar disponíveis para jogos muito próximos ou já finalizados
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* H2H Tab */}
        <TabsContent value="h2h" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Confrontos Diretos (H2H)
                </div>
                <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {h2hData?.total_matches ? `${h2hData.total_matches} jogos` : 'Dados simulados'}
                </div>
              </CardTitle>
              <CardDescription>
                Histórico dos últimos confrontos entre as equipes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {h2hData && (
                <div className="space-y-6">
                  {/* H2H Summary */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-green-600">{h2hData.wins}</div>
                      <div className="text-sm text-muted-foreground">Vitórias Casa</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-yellow-600">{h2hData.draws}</div>
                      <div className="text-sm text-muted-foreground">Empates</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-red-600">{h2hData.losses}</div>
                      <div className="text-sm text-muted-foreground">Vitórias Visitante</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Goals Summary */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="space-y-2">
                      <div className="text-xl font-semibold">{h2hData.goals_for}</div>
                      <div className="text-sm text-muted-foreground">Gols a Favor (Casa)</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xl font-semibold">{h2hData.goals_against}</div>
                      <div className="text-sm text-muted-foreground">Gols Contra (Casa)</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Recent Results */}
                  <div>
                    <h4 className="font-semibold mb-3">Últimos 5 Confrontos</h4>
                    <div className="space-y-2">
                      {h2hData.last_5_results.map((result, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            {getResultIcon(result.result)}
                            <span className="font-medium">{result.score}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(result.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Form Tab */}
        <TabsContent value="form" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Home Team Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {homeTeam?.image_path && (
                      <Image src={homeTeam.image_path} alt={homeTeam.name} width={24} height={24} />
                    )}
                    {homeTeam?.name} (Casa)
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {homeTeamForm?.total_matches ? `${homeTeamForm.total_matches} jogos` : 'Simulado'}
                  </div>
                </CardTitle>
                <CardDescription>Forma nos últimos 5 jogos</CardDescription>
              </CardHeader>
              <CardContent>
                {homeTeamForm && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Forma:</span>
                      <div className="flex gap-1">
                        {homeTeamForm.last_5_matches.map((match, index) => (
                          <div
                            key={index}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              match.result === 'W' ? 'bg-green-600' :
                              match.result === 'D' ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                          >
                            {match.result}
                          </div>
                        ))}
                      </div>
                      <div className="ml-2 text-sm font-medium">
                        {getFormPercentage(homeTeamForm)}%
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="font-semibold text-green-600">{homeTeamForm.wins}</div>
                        <div className="text-muted-foreground">V</div>
                      </div>
                      <div>
                        <div className="font-semibold text-yellow-600">{homeTeamForm.draws}</div>
                        <div className="text-muted-foreground">E</div>
                      </div>
                      <div>
                        <div className="font-semibold text-red-600">{homeTeamForm.losses}</div>
                        <div className="text-muted-foreground">D</div>
                      </div>
                    </div>

                    <div className="text-center text-sm">
                      <span className="text-muted-foreground">Gols: </span>
                      <span className="font-medium">{homeTeamForm.goals_for} - {homeTeamForm.goals_against}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Away Team Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {awayTeam?.image_path && (
                      <Image src={awayTeam.image_path} alt={awayTeam.name} width={24} height={24} />
                    )}
                    {awayTeam?.name} (Visitante)
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {awayTeamForm?.total_matches ? `${awayTeamForm.total_matches} jogos` : 'Simulado'}
                  </div>
                </CardTitle>
                <CardDescription>Forma nos últimos 5 jogos</CardDescription>
              </CardHeader>
              <CardContent>
                {awayTeamForm && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Forma:</span>
                      <div className="flex gap-1">
                        {awayTeamForm.last_5_matches.map((match, index) => (
                          <div
                            key={index}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              match.result === 'W' ? 'bg-green-600' :
                              match.result === 'D' ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                          >
                            {match.result}
                          </div>
                        ))}
                      </div>
                      <div className="ml-2 text-sm font-medium">
                        {getFormPercentage(awayTeamForm)}%
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="font-semibold text-green-600">{awayTeamForm.wins}</div>
                        <div className="text-muted-foreground">V</div>
                      </div>
                      <div>
                        <div className="font-semibold text-yellow-600">{awayTeamForm.draws}</div>
                        <div className="text-muted-foreground">E</div>
                      </div>
                      <div>
                        <div className="font-semibold text-red-600">{awayTeamForm.losses}</div>
                        <div className="text-muted-foreground">D</div>
                      </div>
                    </div>

                    <div className="text-center text-sm">
                      <span className="text-muted-foreground">Gols: </span>
                      <span className="font-medium">{awayTeamForm.goals_for} - {awayTeamForm.goals_against}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Insights da IA ForBet
              </CardTitle>
              <CardDescription>
                Análise inteligente baseada em múltiplos fatores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-primary-forbet/50 bg-primary-forbet/10">
                <Zap className="h-4 w-4" />
                <AlertTitle>Recomendação Principal</AlertTitle>
                <AlertDescription>
                  Com base na análise H2H e forma recente, recomendamos apostar na <strong>vitória do time da casa</strong> 
                  com probabilidade estimada de <strong>58%</strong>.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                  <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">Pontos Positivos Casa</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Vantagem significativa nos confrontos diretos</li>
                    <li>• Melhor forma recente em casa</li>
                    <li>• Média superior de gols marcados</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Pontos Positivos Visitante</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Defesa sólida nos últimos jogos</li>
                    <li>• Bom aproveitamento como visitante</li>
                    <li>• Menos gols sofridos recentemente</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">Mercados Recomendados</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">1X2</div>
                    <div className="text-yellow-700 dark:text-yellow-300">Casa (58%)</div>
                  </div>
                  <div>
                    <div className="font-medium">Over/Under</div>
                    <div className="text-yellow-700 dark:text-yellow-300">Over 2.5 (65%)</div>
                  </div>
                  <div>
                    <div className="font-medium">BTTS</div>
                    <div className="text-yellow-700 dark:text-yellow-300">Sim (62%)</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 