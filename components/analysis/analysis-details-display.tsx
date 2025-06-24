"use client"

import type { DetailedFixtureAnalysis } from "@/app/(platform)/analises/types"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, BarChart2, CalendarDays, Clock, MapPin } from "lucide-react"

interface AnalysisDetailsDisplayProps {
  fixtureDetails: DetailedFixtureAnalysis
  loading?: boolean
}

// Helper para formatar data e hora
const formatDateTime = (isoString: string) => {
  const date = new Date(isoString)
  return {
    date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
    time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  }
}

export function AnalysisDetailsDisplay({ fixtureDetails, loading }: AnalysisDetailsDisplayProps) {
  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Carregando Análise...</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <BarChart2 className="h-12 w-12 animate-pulse text-primary-forbet" />
        </CardContent>
      </Card>
    )
  }

  if (!fixtureDetails) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao Carregar Análise</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="ml-4">Não foi possível carregar os detalhes da partida.</p>
        </CardContent>
      </Card>
    )
  }

  const homeTeam = fixtureDetails.participants?.find((p) => p.meta?.location === "home")
  const awayTeam = fixtureDetails.participants?.find((p) => p.meta?.location === "away")
  const { date, time } = formatDateTime(fixtureDetails.starting_at)

  const renderSportMonksPrediction = (prediction: any) => {
    const predData = prediction.predictions
    const predType = prediction.type?.name || "Desconhecido"

    if (predType === "1X2" && predData.home !== undefined) {
      return (
        <TableRow key={prediction.id}>
          <TableCell className="font-medium">{predType}</TableCell>
          <TableCell>Casa: {predData.home?.toFixed(2)}</TableCell>
          <TableCell>Empate: {predData.draw?.toFixed(2)}</TableCell>
          <TableCell>Fora: {predData.away?.toFixed(2)}</TableCell>
        </TableRow>
      )
    }
    if (predType.toLowerCase().includes("over/under") && predData.total !== undefined) {
      return (
        <TableRow key={prediction.id}>
          <TableCell className="font-medium">
            {predType} ({predData.total})
          </TableCell>
          <TableCell>Mais de: {predData.over?.toFixed(2)}</TableCell>
          <TableCell colSpan={2}>Menos de: {predData.under?.toFixed(2)}</TableCell>
        </TableRow>
      )
    }
    if (predType.toLowerCase().includes("both teams to score") && predData.yes !== undefined) {
      return (
        <TableRow key={prediction.id}>
          <TableCell className="font-medium">{predType}</TableCell>
          <TableCell>Sim: {predData.yes?.toFixed(2)}</TableCell>
          <TableCell colSpan={2}>Não: {predData.no?.toFixed(2)}</TableCell>
        </TableRow>
      )
    }
    return (
      <TableRow key={prediction.id}>
        <TableCell className="font-medium">{predType}</TableCell>
        <TableCell colSpan={3}>{JSON.stringify(predData)}</TableCell>
      </TableRow>
    )
  }

  return (
    <Card className="mt-6 w-full shadow-xl">
      <CardHeader className="bg-gradient-to-r from-primary-forbet/80 to-secondary-forbet/80 text-primary-foreground p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {fixtureDetails.league?.image_path && (
              <Image
                src={fixtureDetails.league.image_path || "/placeholder.svg"}
                alt={fixtureDetails.league.name || ""}
                width={32}
                height={32}
                className="bg-white/20 rounded-full p-0.5"
              />
            )}
            <CardTitle className="text-2xl">{fixtureDetails.league?.name}</CardTitle>
          </div>
          <Badge variant="secondary" className="text-sm">
            {fixtureDetails.state?.name || "Agendado"}
          </Badge>
        </div>
        <div className="mt-4 flex flex-col items-center gap-2 text-center md:flex-row md:justify-around md:text-left">
          <div className="flex items-center gap-3">
            {homeTeam?.image_path && (
              <Image src={homeTeam.image_path || "/placeholder.svg"} alt={homeTeam.name} width={48} height={48} />
            )}
            <span className="text-xl font-bold">{homeTeam?.name || "Time da Casa"}</span>
          </div>
          <span className="text-2xl font-light text-primary-foreground/80">VS</span>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold">{awayTeam?.name || "Time Visitante"}</span>
            {awayTeam?.image_path && (
              <Image src={awayTeam.image_path || "/placeholder.svg"} alt={awayTeam.name} width={48} height={48} />
            )}
          </div>
        </div>
        <CardDescription className="mt-3 text-center text-primary-foreground/90">
          <CalendarDays className="mr-1.5 inline-block h-4 w-4" /> {date}
          <Clock className="ml-3 mr-1.5 inline-block h-4 w-4" /> {time}
          {fixtureDetails.venue?.name && (
            <>
              <MapPin className="ml-3 mr-1.5 inline-block h-4 w-4" /> {fixtureDetails.venue.name}
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="sportmonks_pred" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
            <TabsTrigger value="sportmonks_pred">SportMonks API</TabsTrigger>
            <TabsTrigger value="stats_h2h">H2H & Forma</TabsTrigger>
            <TabsTrigger value="events_info">Eventos Chave</TabsTrigger>
          </TabsList>

          <TabsContent value="sportmonks_pred" className="p-6">
            <h3 className="mb-4 text-xl font-semibold">Predições (SportMonks API)</h3>
            {fixtureDetails.predictions && fixtureDetails.predictions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Casa/Mais</TableHead>
                    <TableHead>Empate</TableHead>
                    <TableHead>Fora/Menos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{fixtureDetails.predictions.map(renderSportMonksPrediction)}</TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">Nenhuma predição da API SportMonks disponível.</p>
            )}
          </TabsContent>

          <TabsContent value="stats_h2h" className="p-6">
            <h3 className="mb-4 text-xl font-semibold">Estatísticas H2H e Forma Recente</h3>
            <p className="text-muted-foreground">
              Dados de confrontos diretos (Head-to-Head) e forma recente das equipes serão exibidos aqui.
              (Funcionalidade em desenvolvimento)
            </p>
          </TabsContent>

          <TabsContent value="events_info" className="p-6">
            <h3 className="mb-4 text-xl font-semibold">Eventos Chave e Informações Adicionais</h3>
            <p className="text-muted-foreground">
              Informações sobre eventos importantes da partida (gols, cartões de jogos anteriores, se aplicável),
              desfalques e outras notas relevantes. (Funcionalidade em desenvolvimento)
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
