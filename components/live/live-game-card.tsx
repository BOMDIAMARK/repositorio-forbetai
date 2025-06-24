"use client"

import Image from "next/image"
import type { LiveScoreFixture } from "@/app/(platform)/ao-vivo/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { getCurrentMinute } from "@/lib/sportmonks-api" // Helper para calcular o minuto

interface LiveGameCardProps {
  fixture: LiveScoreFixture
}

export function LiveGameCard({ fixture }: LiveGameCardProps) {
  const homeTeam = fixture.participants?.find((p) => p.meta?.location === "home")
  const awayTeam = fixture.participants?.find((p) => p.meta?.location === "away")

  const homeScore = fixture.scores?.find((s) => s.score.participant_id === homeTeam?.id && s.description === "CURRENT")
    ?.score.goals
  const awayScore = fixture.scores?.find((s) => s.score.participant_id === awayTeam?.id && s.description === "CURRENT")
    ?.score.goals

  const gameMinute = getCurrentMinute(fixture)
  const statusText = fixture.state?.short_name || "N/A"

  return (
    <Card className="overflow-hidden shadow-md transition-all hover:shadow-lg">
      <CardHeader className="bg-muted/30 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {fixture.league?.image_path && (
              <Image
                src={fixture.league.image_path || "/placeholder.svg"}
                alt={fixture.league.name || "League"}
                width={20}
                height={20}
                className="rounded-sm"
              />
            )}
            <span className="text-xs font-semibold text-muted-foreground truncate max-w-[150px] sm:max-w-xs">
              {fixture.league?.name || "Liga Desconhecida"}
            </span>
          </div>
          {statusText === "LIVE" && gameMinute && (
            <div className="flex items-center gap-1.5 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
              </span>
              LIVE
            </div>
          )}
          {statusText !== "LIVE" && <span className="text-xs font-semibold text-muted-foreground">{statusText}</span>}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex flex-1 flex-col items-center text-center">
            {homeTeam?.image_path && (
              <Image
                src={homeTeam.image_path || "/placeholder.svg"}
                alt={homeTeam.name || "Time da Casa"}
                width={48}
                height={48}
                className="mb-1"
              />
            )}
            <span className="block text-sm font-semibold truncate w-full px-1">{homeTeam?.name || "Time A"}</span>
          </div>

          {/* Score and Time */}
          <div className="mx-2 flex flex-col items-center text-center">
            <span className="text-2xl font-bold">
              {homeScore ?? "-"} : {awayScore ?? "-"}
            </span>
            {statusText === "LIVE" && gameMinute && (
              <span className="mt-1 text-sm font-bold text-red-600">{gameMinute}</span>
            )}
            {statusText !== "LIVE" &&
              gameMinute && ( // Exibe status como HT, FT
                <span className="mt-1 text-sm font-semibold text-muted-foreground">{gameMinute}</span>
              )}
          </div>

          {/* Away Team */}
          <div className="flex flex-1 flex-col items-center text-center">
            {awayTeam?.image_path && (
              <Image
                src={awayTeam.image_path || "/placeholder.svg"}
                alt={awayTeam.name || "Time Visitante"}
                width={48}
                height={48}
                className="mb-1"
              />
            )}
            <span className="block text-sm font-semibold truncate w-full px-1">{awayTeam?.name || "Time B"}</span>
          </div>
        </div>
        {/* Poderia adicionar mais detalhes aqui, como quem marcou gols, cartões, etc. */}
      </CardContent>
      {/* <CardFooter className="p-3 bg-muted/20">
        <Button variant="link" size="sm" className="w-full text-primary-forbet">
          Ver Detalhes da Partida
        </Button>
      </CardFooter> */}
    </Card>
  )
}
