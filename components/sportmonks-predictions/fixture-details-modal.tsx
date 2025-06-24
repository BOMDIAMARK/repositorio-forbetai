"use client"

import type React from "react"

import type { SportMonksFixtureDetails, SportMonksStatistic } from "@/app/(platform)/predicoes/types-sportmonks"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, Shield, Zap, CornerRightDown, RectangleVertical, Target } from "lucide-react" // Example icons
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface FixtureDetailsModalProps {
  details: SportMonksFixtureDetails | null
  isOpen: boolean
  onClose: () => void
}

const StatDisplay: React.FC<{
  title: string
  homeValue: string | number
  awayValue: string | number
  icon?: React.ElementType
}> = ({ title, homeValue, awayValue, icon: Icon }) => (
  <div className="flex justify-between items-center py-2 border-b">
    <div className="flex items-center text-sm">
      {Icon && <Icon className="h-4 w-4 mr-2 text-primary-forbet" />}
      {title}
    </div>
    <div className="flex gap-4 text-sm">
      <span className="w-8 text-center font-medium">{homeValue}</span>
      <span className="w-8 text-center font-medium">{awayValue}</span>
    </div>
  </div>
)

export function FixtureDetailsModal({ details, isOpen, onClose }: FixtureDetailsModalProps) {
  if (!details) return null

  const homeTeam = details.participants?.find(
    (p) => p.meta?.location === "home" || p.name === details.name.split(" vs ")[0],
  ) // Fallback if meta.location is missing
  const awayTeam = details.participants?.find(
    (p) => p.meta?.location === "away" || p.name === details.name.split(" vs ")[1],
  )

  const getStatValue = (typeCode: string, participantId?: number): string | number => {
    const stat = details.statistics?.data.find(
      (s) => s.type?.code === typeCode && (participantId ? s.participant_id === participantId : true),
    )
    return stat?.data.value ?? "-"
  }

  const allStats = details.statistics?.data || []
  const homeStats = allStats.filter((s) => s.participant_id === homeTeam?.id)
  const awayStats = allStats.filter((s) => s.participant_id === awayTeam?.id)

  const renderGroupedStats = (stats: SportMonksStatistic[], title: string) => {
    if (!stats || stats.length === 0)
      return <p className="text-sm text-muted-foreground">Nenhuma estatística de {title.toLowerCase()} disponível.</p>
    return (
      <div className="mb-4">
        <h4 className="font-semibold text-md mb-2">{title}</h4>
        {stats.map((stat) => (
          <div key={stat.id} className="flex justify-between items-center py-1 border-b text-sm">
            <span>{stat.type?.name || "Desconhecido"}</span>
            <span className="font-medium">{stat.data.value ?? "-"}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Detalhes: {details.name}</DialogTitle>
          <DialogDescription>Estatísticas detalhadas da partida.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(80vh-120px)] pr-3 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas da Partida</CardTitle>
              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                <span>Estatística</span>
                <div className="flex gap-4">
                  <span className="w-8 text-center font-semibold">{homeTeam?.short_code || "Casa"}</span>
                  <span className="w-8 text-center font-semibold">{awayTeam?.short_code || "Fora"}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StatDisplay
                title="Gols"
                homeValue={getStatValue("goals", homeTeam?.id)}
                awayValue={getStatValue("goals", awayTeam?.id)}
                icon={Zap}
              />
              <StatDisplay
                title="Finalizações"
                homeValue={getStatValue("shots-total", homeTeam?.id)}
                awayValue={getStatValue("shots-total", awayTeam?.id)}
                icon={BarChart2}
              />
              <StatDisplay
                title="Finalizações no Alvo"
                homeValue={getStatValue("shots-on-goal", homeTeam?.id)}
                awayValue={getStatValue("shots-on-goal", awayTeam?.id)}
                icon={Target}
              />
              <StatDisplay
                title="Posse de Bola (%)"
                homeValue={getStatValue("ball-possession", homeTeam?.id)}
                awayValue={getStatValue("ball-possession", awayTeam?.id)}
                icon={Shield}
              />
              <StatDisplay
                title="Escanteios"
                homeValue={getStatValue("corners", homeTeam?.id)}
                awayValue={getStatValue("corners", awayTeam?.id)}
                icon={CornerRightDown}
              />
              <StatDisplay
                title="Cartões Amarelos"
                homeValue={getStatValue("yellowcards", homeTeam?.id)}
                awayValue={getStatValue("yellowcards", awayTeam?.id)}
                icon={RectangleVertical}
              />
              <StatDisplay
                title="Cartões Vermelhos"
                homeValue={getStatValue("redcards", homeTeam?.id)}
                awayValue={getStatValue("redcards", awayTeam?.id)}
                icon={RectangleVertical}
              />
              {/* Add more specific stats as needed */}
            </CardContent>
          </Card>

          <Accordion type="multiple" className="w-full mt-4">
            <AccordionItem value="home-stats">
              <AccordionTrigger>Estatísticas Completas - {homeTeam?.name || "Time da Casa"}</AccordionTrigger>
              <AccordionContent>{renderGroupedStats(homeStats, homeTeam?.name || "Time da Casa")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="away-stats">
              <AccordionTrigger>Estatísticas Completas - {awayTeam?.name || "Time Visitante"}</AccordionTrigger>
              <AccordionContent>{renderGroupedStats(awayStats, awayTeam?.name || "Time Visitante")}</AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Raw JSON for debugging or complete data view */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-md">Dados Brutos (JSON)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                {JSON.stringify(details.statistics, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
