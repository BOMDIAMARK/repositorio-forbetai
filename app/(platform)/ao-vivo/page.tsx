"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Play, Pause } from "lucide-react"

// Mock data para jogos ao vivo
const mockLiveGames = [
  {
    id: "1",
    homeTeam: { name: "Barcelona", score: 2, logo: "" },
    awayTeam: { name: "Real Madrid", score: 1, logo: "" },
    league: { name: "La Liga", country: "Espanha" },
    minute: 67,
    status: "LIVE",
    events: [
      { minute: 15, type: "goal", team: "home", player: "Lewandowski" },
      { minute: 34, type: "goal", team: "away", player: "Benzema" },
      { minute: 58, type: "goal", team: "home", player: "Pedri" },
    ]
  },
  {
    id: "2", 
    homeTeam: { name: "Manchester City", score: 0, logo: "" },
    awayTeam: { name: "Liverpool", score: 0, logo: "" },
    league: { name: "Premier League", country: "Inglaterra" },
    minute: 23,
    status: "LIVE",
    events: []
  }
]

interface LiveGameData {
  id: string
  homeTeam: { name: string; score: number; logo: string }
  awayTeam: { name: string; score: number; logo: string }
  league: { name: string; country: string }
  minute: number
  status: string
  events: Array<{ minute: number; type: string; team: string; player: string }>
}

export default function LivePage() {
  const liveGames: LiveGameData[] = mockLiveGames

  const getStatusColor = (status: string) => {
    switch (status) {
      case "LIVE": return "bg-red-500 text-white"
      case "HT": return "bg-yellow-500 text-white"
      case "FT": return "bg-gray-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "goal": return "⚽"
      case "yellow": return "🟡"
      case "red": return "🟥"
      default: return "📝"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          <Play className="h-8 w-8 text-red-500" />
          Jogos Ao Vivo
        </h1>
        <p className="text-muted-foreground">
          Acompanhe os jogos em tempo real com estatísticas atualizadas
        </p>
      </div>

      {/* Live Games */}
      <div className="space-y-4">
        {liveGames.map((game) => (
          <Card key={game.id} className="border-2 border-red-500/20 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(game.status)}>
                    {game.status === "LIVE" ? `${game.minute}'` : game.status}
                  </Badge>
                  <Badge variant="outline">{game.league.name}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-500 font-medium">AO VIVO</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Score */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-8 mb-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-xs font-bold">
                        {game.homeTeam.name.substring(0, 3).toUpperCase()}
                      </span>
                    </div>
                    <p className="font-medium text-sm">{game.homeTeam.name}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl font-bold">
                      {game.homeTeam.score} - {game.awayTeam.score}
                    </div>
                    <div className="flex items-center justify-center mt-1 space-x-1">
                      <Clock className="h-3 w-3 text-red-500" />
                      <span className="text-xs text-red-500 font-medium">{game.minute}&apos;</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-xs font-bold">
                        {game.awayTeam.name.substring(0, 3).toUpperCase()}
                      </span>
                    </div>
                    <p className="font-medium text-sm">{game.awayTeam.name}</p>
                  </div>
                </div>
              </div>
              
              {/* Events Timeline */}
              {game.events.length > 0 && (
                <div className="bg-muted rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-2">Eventos do Jogo</h4>
                  <div className="space-y-2">
                    {game.events.slice(-3).reverse().map((event, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <span className="text-xs text-muted-foreground w-8">{event.minute}&apos;</span>
                        <span className="text-lg">{getEventIcon(event.type)}</span>
                        <span className="flex-1">
                          {event.player} ({event.team === "home" ? game.homeTeam.name : game.awayTeam.name})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Pause className="h-4 w-4 mr-1" />
                  Estatísticas
                </Button>
                <Button variant="outline" className="flex-1">
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {liveGames.length === 0 && (
        <div className="text-center py-12">
          <Play className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum jogo ao vivo</h3>
          <p className="mt-2 text-muted-foreground">
            Não há jogos acontecendo no momento. Volte mais tarde!
          </p>
        </div>
      )}
    </div>
  )
}
