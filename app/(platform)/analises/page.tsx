"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import type { UpcomingFixtureForAnalysis, DetailedFixtureAnalysis } from "./types"
import { AnalysisDetailsDisplay } from "@/components/analysis/analysis-details-display"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Search, BarChartHorizontalBig, Loader2, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function AnalisesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [upcomingFixtures, setUpcomingFixtures] = useState<UpcomingFixtureForAnalysis[]>([])
  const [loadingUpcoming, setLoadingUpcoming] = useState(true)
  const [selectedFixtureId, setSelectedFixtureId] = useState<number | null>(null)
  const [fixtureDetails, setFixtureDetails] = useState<DetailedFixtureAnalysis | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [errorUpcoming, setErrorUpcoming] = useState<string | null>(null)

  useEffect(() => {
    async function loadUpcomingFixtures() {
      setLoadingUpcoming(true)
      setErrorUpcoming(null)
      try {
        const response = await fetch("/api/analises/upcoming-fixtures")
        if (!response.ok) {
          const errorResult = await response
            .json()
            .catch(() => ({ error: "Erro desconhecido ao buscar próximos jogos." }))
          throw new Error(errorResult.error || "Falha ao buscar próximos jogos.")
        }
        const result = await response.json()
        setUpcomingFixtures(result.data || [])
      } catch (err: any) {
        console.error("Erro ao buscar próximos jogos:", err)
        setErrorUpcoming(err.message)
        setUpcomingFixtures([])
      } finally {
        setLoadingUpcoming(false)
      }
    }
    loadUpcomingFixtures()
  }, [])

  const handleSelectFixture = useCallback(async (fixtureId: number) => {
    setSelectedFixtureId(fixtureId)
    setLoadingDetails(true)
    setErrorDetails(null)
    setFixtureDetails(null)

    try {
      // Buscar detalhes da fixture da SportMonks
      const fixtureDetailsResponse = await fetch(`/api/analises/fixture/${fixtureId}`)
      if (!fixtureDetailsResponse.ok) {
        const errorResult = await fixtureDetailsResponse
          .json()
          .catch(() => ({ error: "Erro desconhecido ao buscar detalhes da partida." }))
        throw new Error(
          errorResult.error ||
            `Falha ao buscar detalhes da partida (ID: ${fixtureId}). Status: ${fixtureDetailsResponse.status}`,
        )
      }
      const fixtureResult = await fixtureDetailsResponse.json()

      if (fixtureResult.data) {
        setFixtureDetails(fixtureResult.data)
      } else {
        setErrorDetails("Não foram encontrados detalhes para a partida selecionada.")
      }
    } catch (error: any) {
      console.error("Erro ao buscar dados da partida:", error)
      setErrorDetails(error.message || "Ocorreu um erro ao buscar os dados. Tente novamente.")
    } finally {
      setLoadingDetails(false)
    }
  }, [])

  const filteredUpcomingFixtures = upcomingFixtures.filter(
    (fixture) =>
      fixture.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fixture.leagueName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Análise de Partidas</h1>
          <p className="text-muted-foreground">
            Selecione uma partida abaixo para ver uma análise detalhada e predições.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximas Partidas para Análise</CardTitle>
          <CardDescription>Busque e selecione uma partida da lista.</CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por time ou liga..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loadingUpcoming && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary-forbet" />
              <p className="ml-3">Carregando próximas partidas...</p>
            </div>
          )}
          {errorUpcoming && !loadingUpcoming && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro ao Carregar Partidas</AlertTitle>
              <AlertDescription>{errorUpcoming}</AlertDescription>
            </Alert>
          )}
          {!loadingUpcoming && !errorUpcoming && filteredUpcomingFixtures.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredUpcomingFixtures.map((fixture) => (
                <Card
                  key={fixture.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-primary-forbet"
                  onClick={() => handleSelectFixture(fixture.id)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium truncate max-w-[calc(100%-30px)]">
                      {fixture.leagueName}
                    </CardTitle>
                    {fixture.leagueLogo && (
                      <Image
                        src={fixture.leagueLogo || "/placeholder.svg"}
                        alt={fixture.leagueName}
                        width={24}
                        height={24}
                        unoptimized
                      />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>{format(new Date(fixture.matchDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      {fixture.teamALogo && (
                        <Image
                          src={fixture.teamALogo || "/placeholder.svg"}
                          alt=""
                          width={28}
                          height={28}
                          unoptimized
                        />
                      )}
                      <p className="text-sm font-semibold truncate text-center flex-1 min-w-0">{fixture.name}</p>
                      {fixture.teamBLogo && (
                        <Image
                          src={fixture.teamBLogo || "/placeholder.svg"}
                          alt=""
                          width={28}
                          height={28}
                          unoptimized
                        />
                      )}
                    </div>
                    <Button variant="link" size="sm" className="w-full mt-2 text-primary-forbet p-0 h-auto">
                      Analisar Partida
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!loadingUpcoming &&
            !errorUpcoming &&
            filteredUpcomingFixtures.length === 0 &&
            upcomingFixtures.length > 0 && ( // Caso de busca não encontrar nada
              <p className="text-center text-muted-foreground py-8">
                Nenhuma partida encontrada com o termo "{searchTerm}".
              </p>
            )}
          {!loadingUpcoming &&
            !errorUpcoming &&
            upcomingFixtures.length === 0 &&
            searchTerm.length === 0 && ( // Caso inicial sem jogos
              <p className="text-center text-muted-foreground py-8">
                Nenhuma próxima partida encontrada no momento. Verifique mais tarde.
              </p>
            )}
        </CardContent>
      </Card>

      {selectedFixtureId && (loadingDetails || fixtureDetails || errorDetails) && (
        <>
          {loadingDetails && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-card p-8 text-center shadow-sm">
              <Loader2 className="h-10 w-10 animate-spin text-primary-forbet" />
              <p className="font-semibold">Carregando análise detalhada...</p>
            </div>
          )}
          {errorDetails && !loadingDetails && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro ao Carregar Análise</AlertTitle>
              <AlertDescription>
                {errorDetails}
                <Button
                  variant="link"
                  onClick={() => handleSelectFixture(selectedFixtureId)}
                  className="p-0 h-auto ml-1"
                >
                  Tentar novamente.
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {fixtureDetails && !loadingDetails && !errorDetails && (
            <AnalysisDetailsDisplay fixtureDetails={fixtureDetails} />
          )}
        </>
      )}
      {!selectedFixtureId &&
        !loadingDetails && ( // Mensagem inicial antes de selecionar qualquer jogo
          <Alert variant="default" className="border-primary-forbet/50 bg-primary-forbet/10 text-primary-forbet">
            <BarChartHorizontalBig className="h-5 w-5 text-primary-forbet" />
            <AlertTitle className="font-semibold">Selecione uma Partida</AlertTitle>
            <AlertDescription>
              Clique em uma das partidas da lista acima para visualizar a análise completa da SportMonks API.
            </AlertDescription>
          </Alert>
        )}
    </div>
  )
}
