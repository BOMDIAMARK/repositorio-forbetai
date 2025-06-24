"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ClockIcon, TrophyIcon } from "lucide-react"
import { FixtureDetailsModal } from "./fixture-details-modal"
import type { SportMonksFixture } from "@/app/(platform)/predicoes/types-sportmonks"
import { formatOdd, getOddColor } from "@/lib/odds-mapper"
import { getFixtureProviderInfo } from "@/lib/fixture-adapter"

interface SportmonksPredictionCardProps {
  fixture: SportMonksFixture
}

export function SportmonksPredictionCard({ fixture }: SportmonksPredictionCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Parse participants to get team information
  const homeTeam = fixture.participants?.find((p) => p.meta?.location === "home")
  const awayTeam = fixture.participants?.find((p) => p.meta?.location === "away")

  // Format date and time
  const matchDate = new Date(fixture.starting_at)
  const isValidDate = !isNaN(matchDate.getTime())

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get league name if available
  const leagueName = (fixture.league as any)?.data?.name || (fixture.league as any)?.name || "Liga Desconhecida"

  // Get provider info for enhanced display
  const providerInfo = getFixtureProviderInfo(fixture as any)
  
  // Get real odds if available, otherwise show placeholders
  const hasRealOdds = fixture.processedOdds?.fullTimeResult
  const odds = hasRealOdds ? {
    home: formatOdd(fixture.processedOdds!.fullTimeResult!.home),
    draw: formatOdd(fixture.processedOdds!.fullTimeResult!.draw),
    away: formatOdd(fixture.processedOdds!.fullTimeResult!.away)
  } : {
    home: "-",
    draw: "-", 
    away: "-"
  }

  // Provider info styling
  const getProviderBadgeStyle = (cost: string) => {
    switch (cost) {
      case 'free': return 'bg-green-600 text-white'
      case 'low': return 'bg-blue-600 text-white'
      case 'medium': return 'bg-yellow-600 text-white'
      case 'high': return 'bg-red-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  return (
    <>
      <Card className="w-full max-w-sm mx-auto bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700 hover:border-slate-600 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-slate-700 text-slate-200 text-xs">
              {leagueName}
            </Badge>
            <div className="flex items-center gap-1">
              <Badge 
                className={`text-xs px-1.5 py-0.5 ${getProviderBadgeStyle(providerInfo.cost)}`}
                title={`Fonte: ${providerInfo.provider} (${providerInfo.cost})`}
              >
                {providerInfo.provider.charAt(0)}
              </Badge>
              <TrophyIcon className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Match Teams */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center flex-1">
                <div className="w-10 h-10 mx-auto mb-2 bg-slate-700 rounded-full flex items-center justify-center">
                  {homeTeam?.image_path ? (
                    <img 
                      src={homeTeam.image_path} 
                      alt={homeTeam.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold">
                      {homeTeam?.name?.substring(0, 3).toUpperCase() || "GOI"}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium">{homeTeam?.name || "Goiás"}</p>
              </div>

              <div className="text-2xl font-bold text-slate-300">vs</div>

              <div className="text-center flex-1">
                <div className="w-10 h-10 mx-auto mb-2 bg-slate-700 rounded-full flex items-center justify-center">
                  {awayTeam?.image_path ? (
                    <img 
                      src={awayTeam.image_path} 
                      alt={awayTeam.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold">
                      {awayTeam?.name?.substring(0, 3).toUpperCase() || "ATH"}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium">{awayTeam?.name || "Athletic Club"}</p>
              </div>
            </div>
          </div>

          {/* Match Date & Time */}
          <div className="flex items-center justify-center space-x-4 text-sm text-slate-300">
            <div className="flex items-center space-x-1">
              <CalendarIcon className="h-4 w-4" />
              <span>{isValidDate ? formatDate(matchDate) : "Data não disponível"}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-4 w-4" />
              <span>{isValidDate ? formatTime(matchDate) : "Horário não disponível"}</span>
            </div>
          </div>

          {/* Odds Section */}
          <div className="bg-slate-800 rounded-lg p-3">
            <h3 className="text-sm font-semibold mb-2 text-center text-slate-200">💰 Odds (1X2):</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-700 rounded p-2">
                <p className="text-xs text-slate-400">Casa:</p>
                <p className={`font-bold ${hasRealOdds ? getOddColor(fixture.processedOdds!.fullTimeResult!.home) : 'text-green-400'}`}>
                  {odds.home}
                </p>
              </div>
              <div className="bg-slate-700 rounded p-2">
                <p className="text-xs text-slate-400">Empate:</p>
                <p className={`font-bold ${hasRealOdds ? getOddColor(fixture.processedOdds!.fullTimeResult!.draw) : 'text-yellow-400'}`}>
                  {odds.draw}
                </p>
              </div>
              <div className="bg-slate-700 rounded p-2">
                <p className="text-xs text-slate-400">Fora:</p>
                <p className={`font-bold ${hasRealOdds ? getOddColor(fixture.processedOdds!.fullTimeResult!.away) : 'text-red-400'}`}>
                  {odds.away}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">
              {providerInfo.hasRealOdds 
                ? `✅ Odds reais via ${providerInfo.provider}` 
                : `⏳ Odds disponíveis nos detalhes`
              }
            </p>
          </div>

          {/* Details Button */}
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 rounded-lg transition-all duration-200"
          >
            📊 Ver Detalhes & Predições {providerInfo.hasRealOdds ? '💰' : '🎯'}
          </Button>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <FixtureDetailsModal
        fixture={fixture}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
