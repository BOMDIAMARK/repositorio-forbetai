"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import type { UpcomingFixtureForAnalysis } from "./types"
import { AIAnalysisModal } from "@/components/analysis/ai-analysis-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Search, BarChartHorizontalBig, Loader2, AlertTriangle, Brain, Activity } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRealTimeUpdates } from "@/hooks/use-real-time-updates"

export default function AnalisesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedFixture, setSelectedFixture] = useState<{ id: number; name: string } | null>(null)

  // Use real-time updates for upcoming fixtures
  const { 
    data: upcomingData, 
    loading: loadingUpcoming, 
    error: errorUpcoming,
    status,
    manualRefresh
  } = useRealTimeUpdates<any>({
    endpoint: "/api/analises/upcoming-fixtures",
    interval: 60000, // Update every minute for upcoming fixtures
    enabled: true
  })

  const upcomingFixtures = upcomingData?.data || []

  const handleSelectFixture = useCallback((fixtureId: number, fixtureName: string) => {
    setSelectedFixture({ id: fixtureId, name: fixtureName })
    setModalOpen(true)
  }, [])

  const filteredUpcomingFixtures = upcomingFixtures.filter(
    (fixture: any) =>
      fixture.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fixture.leagueName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Análise de Partidas</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Selecione uma partida abaixo para ver uma análise detalhada e predições.</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                status.isUpdating ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
              }`} />
              <span>
                {status.isUpdating ? 'Atualizando...' : 'Atualizado'}
              </span>
              {status.lastUpdated && (
                <span className="text-xs">
                  ({status.lastUpdated.toLocaleTimeString('pt-BR')})
                </span>
              )}
            </div>
          </div>
        </div>
        <Button onClick={manualRefresh} variant="outline" size="sm" disabled={status.isUpdating}>
          {status.isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
          Atualizar Lista
        </Button>
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
              {filteredUpcomingFixtures.map((fixture: any) => (
                <Card
                  key={fixture.id}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-primary-forbet"
                  onClick={() => handleSelectFixture(fixture.id, fixture.name)}
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
                    <Button variant="link" size="sm" className="w-full mt-2 text-primary-forbet p-0 h-auto flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Analisar com IA
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

      {/* Initial Message */}
      <Alert variant="default" className="border-primary-forbet/50 bg-primary-forbet/10 text-primary-forbet">
        <Brain className="h-5 w-5 text-primary-forbet" />
        <AlertTitle className="font-semibold">Análise Inteligente Powered by IA</AlertTitle>
        <AlertDescription>
          Clique em <strong>"Analisar com IA"</strong> para uma análise completa incluindo dados H2H, forma das equipes e insights personalizados.
        </AlertDescription>
      </Alert>

      {/* AI Analysis Modal */}
      <AIAnalysisModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        fixtureId={selectedFixture?.id || 0}
        fixtureName={selectedFixture?.name || ""}
      />
    </div>
  )
}
