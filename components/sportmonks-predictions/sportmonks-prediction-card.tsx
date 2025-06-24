"use client"

import { AlertDescription } from "@/components/ui/alert"

import { Alert } from "@/components/ui/alert"

import { useState } from "react"
import Image from "next/image"
import type { SportMonksFixture, SportMonksFixtureDetails } from "@/app/(platform)/predicoes/types-sportmonks"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, BarChart2, Loader2, AlertCircle } from "lucide-react"
import { FixtureDetailsModal } from "./fixture-details-modal"

interface SportmonksPredictionCardProps {
  fixture: SportMonksFixture
}

export function SportmonksPredictionCard({ fixture }: SportmonksPredictionCardProps) {
  const [details, setDetails] = useState<SportMonksFixtureDetails | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleDetailsClick = async () => {
    if (details) {
      // If details already fetched, just open modal
      setIsModalOpen(true)
      return
    }
    setLoadingDetails(true)
    setErrorDetails(null)
    try {
      const res = await fetch(`/api/sportmonks/fixtures/${fixture.id}`)
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Erro ao carregar detalhes do jogo.")
      }
      const data: SportMonksFixtureDetails = await res.json()
      setDetails(data)
      setIsModalOpen(true)
    } catch (error: any) {
      console.error("Erro ao carregar detalhes:", error)
      setErrorDetails(error.message)
    }
    setLoadingDetails(false)
  }

  const homeTeam = fixture.participants?.find(
    (p) => p.meta?.location === "home" || p.name === fixture.name.split(" vs ")[0],
  )
  const awayTeam = fixture.participants?.find(
    (p) => p.meta?.location === "away" || p.name === fixture.name.split(" vs ")[1],
  )

  const matchDate = new Date(fixture.starting_at)
  const formattedDate = matchDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
  const formattedTime = matchDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

  // Extracting odds (example for 1X2 market)
  const marketOdds = fixture.odds?.data?.[0]?.bookmaker?.data?.[0]?.odds?.data || []
  const homeOdd = marketOdds.find((odd) => odd.label === "1")?.value || "-"
  const drawOdd = marketOdds.find((odd) => odd.label === "X")?.value || "-"
  const awayOdd = marketOdds.find((odd) => odd.label === "2")?.value || "-"

  // Extracting a prediction confidence (example: home team win probability)
  // This path is highly dependent on what 'predictions' include returns.
  // The user's example used `fixture.predictions?.data?.[0]?.probability_home_team_winner`
  // SportMonks predictions can be complex. Let's try to find a specific prediction type.
  const mainPrediction = fixture.predictions?.data?.find((p) => p.type?.code === "WINNER") // Example for Match Winner
  let confidenceDisplay = "-"
  if (mainPrediction?.predictions?.home) {
    confidenceDisplay = `Casa: ${(Number.parseFloat(mainPrediction.predictions.home.toString()) * 100).toFixed(0)}%`
  } else if (fixture.predictions?.data?.[0]?.predictions?.home) {
    // Fallback to first prediction if specific type not found
    confidenceDisplay = `Casa: ${(Number.parseFloat(fixture.predictions.data[0].predictions.home.toString()) * 100).toFixed(0)}%`
  }

  return (
    <>
      <Card className="w-full overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {fixture.league?.data.image_path && (
                <Image
                  src={fixture.league.data.image_path || "/placeholder.svg"}
                  alt={fixture.league.data.name}
                  width={16}
                  height={16}
                  className="rounded-sm"
                  unoptimized
                />
              )}
              <span>{fixture.league?.data.name || "Liga Desconhecida"}</span>
            </div>
            <Badge variant="outline">{confidenceDisplay}</Badge>
          </div>
          <CardTitle className="text-lg md:text-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div className="flex items-center gap-2">
                {homeTeam?.image_path && (
                  <Image
                    src={homeTeam.image_path || "/placeholder.svg"}
                    alt={homeTeam.name}
                    width={24}
                    height={24}
                    unoptimized
                  />
                )}
                <span>{homeTeam?.name || "Time da Casa"}</span>
              </div>
              <span className="text-sm font-normal text-muted-foreground self-center">vs</span>
              <div className="flex items-center gap-2">
                {awayTeam?.image_path && (
                  <Image
                    src={awayTeam.image_path || "/placeholder.svg"}
                    alt={awayTeam.name}
                    width={24}
                    height={24}
                    unoptimized
                  />
                )}
                <span>{awayTeam?.name || "Time Visitante"}</span>
              </div>
            </div>
          </CardTitle>
          <CardDescription className="!mt-2 text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
            <span className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1" /> {formattedDate}
            </span>
            <span className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" /> {formattedTime}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-sm space-y-1">
            <p className="font-medium">Odds (1X2):</p>
            <div className="flex justify-around text-center">
              <div>
                Casa: <Badge variant="secondary">{homeOdd}</Badge>
              </div>
              <div>
                Empate: <Badge variant="secondary">{drawOdd}</Badge>
              </div>
              <div>
                Fora: <Badge variant="secondary">{awayOdd}</Badge>
              </div>
            </div>
          </div>
          {errorDetails && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorDetails}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="p-4 bg-muted/30">
          <Button className="w-full" onClick={handleDetailsClick} disabled={loadingDetails}>
            {loadingDetails ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BarChart2 className="h-4 w-4 mr-2" />
            )}
            Ver Detalhes
          </Button>
        </CardFooter>
      </Card>
      <FixtureDetailsModal details={details} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
