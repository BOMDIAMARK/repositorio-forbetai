"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, TrendingUp, Target } from "lucide-react"

interface UpcomingFixtureForAnalysis {
  id: string
  home_team: { name: string; logo?: string }
  away_team: { name: string; logo?: string }
  league: { name: string }
  match_date: string
  status: string
  ai_confidence?: number
}

// Mock data com IDs reais da SportMonks (FIFA Club World Cup)
const mockFixtures: UpcomingFixtureForAnalysis[] = [
  {
    id: "19338814",
    home_team: { name: "Inter Miami", logo: "https://cdn.sportmonks.com/images/soccer/teams/3/239235.png" },
    away_team: { name: "Palmeiras", logo: "https://cdn.sportmonks.com/images/soccer/teams/30/3422.png" },
    league: { name: "FIFA Club World Cup" },
    match_date: "2024-01-15T20:00:00Z",
    status: "SCHEDULED",
    ai_confidence: 85
  },
  {
    id: "19338815",
    home_team: { name: "Porto", logo: "https://cdn.sportmonks.com/images/soccer/teams/12/652.png" },
    away_team: { name: "Al Ahly", logo: "https://cdn.sportmonks.com/images/soccer/teams/12/460.png" },
    league: { name: "FIFA Club World Cup" },
    match_date: "2024-01-16T15:30:00Z",
    status: "SCHEDULED",
    ai_confidence: 78
  },
  {
    id: "19339042",
    home_team: { name: "Benfica", logo: "https://cdn.sportmonks.com/images/soccer/teams/29/605.png" },
    away_team: { name: "FC Bayern München", logo: "https://cdn.sportmonks.com/images/soccer/teams/23/503.png" },
    league: { name: "FIFA Club World Cup" },
    match_date: "2024-01-17T19:30:00Z",
    status: "SCHEDULED",
    ai_confidence: 82
  },
  {
    id: "19339043",
    home_team: { name: "Auckland City", logo: "https://cdn.sportmonks.com/images/soccer/teams/30/1022.png" },
    away_team: { name: "Boca Juniors", logo: "https://cdn.sportmonks.com/images/soccer/teams/11/587.png" },
    league: { name: "FIFA Club World Cup" },
    match_date: "2024-01-18T21:00:00Z",
    status: "SCHEDULED",
    ai_confidence: 73
  },
  {
    id: "19338812",
    home_team: { name: "Real Madrid", logo: "https://cdn.sportmonks.com/images/soccer/teams/29/541.png" },
    away_team: { name: "Chelsea", logo: "https://cdn.sportmonks.com/images/soccer/teams/18/498.png" },
    league: { name: "FIFA Club World Cup" },
    match_date: "2024-01-19T20:45:00Z",
    status: "SCHEDULED",
    ai_confidence: 79
  },
  {
    id: "19338813",
    home_team: { name: "Manchester City", logo: "https://cdn.sportmonks.com/images/soccer/teams/17/481.png" },
    away_team: { name: "Liverpool", logo: "https://cdn.sportmonks.com/images/soccer/teams/14/494.png" },
    league: { name: "FIFA Club World Cup" },
    match_date: "2024-01-20T16:00:00Z",
    status: "SCHEDULED",
    ai_confidence: 88
  }
]

export default function AnalysisPage() {
  const [fixtures] = useState<UpcomingFixtureForAnalysis[]>(mockFixtures)
  const [loading] = useState(false)

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  }



  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800'
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando análises...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Análises Avançadas</h1>
        <p className="text-muted-foreground">
          Análises detalhadas com IA para os próximos jogos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Análises</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fixtures.length}</div>
            <p className="text-xs text-muted-foreground">Jogos analisados hoje</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confiança Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(fixtures.reduce((acc, f) => acc + (f.ai_confidence || 0), 0) / fixtures.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Baseado em algoritmos de IA</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alta Confiança</CardTitle>
            <Badge className="bg-green-100 text-green-800">
              {fixtures.filter(f => (f.ai_confidence || 0) >= 80).length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fixtures.filter(f => (f.ai_confidence || 0) >= 80).length}
            </div>
            <p className="text-xs text-muted-foreground">Análises com +80% de confiança</p>
          </CardContent>
        </Card>
      </div>

      {/* Fixtures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fixtures.map((fixture) => {
          const { date, time } = formatMatchDate(fixture.match_date)
          
          return (
            <Card key={fixture.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{fixture.league.name}</Badge>
                  <Badge className={getConfidenceBadge(fixture.ai_confidence || 0)}>
                    {fixture.ai_confidence || 0}% IA
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Teams */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-4 mb-3">
                                      <div className="text-center">
                    <div className="w-8 h-8 rounded-full mx-auto mb-1 overflow-hidden border">
                      <img 
                        src={fixture.home_team.logo} 
                        alt={fixture.home_team.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium">{fixture.home_team.name}</span>
                  </div>
                  <span className="font-bold text-muted-foreground">VS</span>
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full mx-auto mb-1 overflow-hidden border">
                      <img 
                        src={fixture.away_team.logo} 
                        alt={fixture.away_team.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium">{fixture.away_team.name}</span>
                  </div>
                  </div>
                </div>
                
                {/* Date & Time */}
                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{time}</span>
                  </div>
                </div>
                
                {/* AI Analysis Preview */}
                <div className="bg-muted rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-2">Análise da IA</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Resultado mais provável:</span>
                      <span className="font-medium">Casa (65%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total de gols:</span>
                      <span className="font-medium">Mais de 2.5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ambas marcam:</span>
                      <span className="font-medium">Sim (72%)</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Button */}
                <Button className="w-full" asChild>
                  <a href={`/analise/${fixture.id}`}>
                    Ver Análise Completa
                  </a>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {fixtures.length === 0 && (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma análise disponível</h3>
          <p className="mt-2 text-muted-foreground">
            Não há jogos programados para análise no momento.
          </p>
        </div>
      )}
    </div>
  )
}
