import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, BarChartBig, CalendarCheck, DollarSign } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Taxa de Acerto",
      value: "87%",
      icon: <CalendarCheck className="h-6 w-6 text-green-500" />,
      change: "+2.1% vs Mês Passado",
    },
    {
      title: "ROI (Últimos 30d)",
      value: "+15.3%",
      icon: <DollarSign className="h-6 w-6 text-blue-500" />,
      change: "+5% vs Mês Passado",
    },
    { title: "Predições Hoje", value: "12", icon: <Activity className="h-6 w-6 text-purple-500" />, change: "3 Novas" },
    {
      title: "Jogos Ativos",
      value: "3",
      icon: <BarChartBig className="h-6 w-6 text-orange-500" />,
      change: "1 Finalizado",
    },
  ]

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold md:text-3xl">Dashboard</h1>
        {/* Placeholder for date range picker or other actions */}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Performance (Últimos 7 dias)</CardTitle>
            <CardDescription>Visualização do seu progresso recente.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {/* Placeholder for Chart Component */}
            <p className="text-muted-foreground">Gráfico de Performance em breve...</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Próximos Jogos e Predições</CardTitle>
            <CardDescription>Fique de olho nas próximas oportunidades.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {/* Placeholder for Upcoming Games List */}
            <p className="text-muted-foreground">Lista de Próximos Jogos em breve...</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Predições em Destaque</CardTitle>
          <CardDescription>As melhores oportunidades selecionadas pela IA.</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground">Predições em Destaque em breve...</p>
        </CardContent>
      </Card>
    </>
  )
}
