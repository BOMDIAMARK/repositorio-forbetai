import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, BarChart3, BrainCircuit, ShieldCheck, Target, Zap } from "lucide-react"
import { SiteHeader } from "@/components/site-header" // A general site header for public pages

const features = [
  {
    icon: <BrainCircuit className="h-10 w-10 text-primary-forbet" />,
    title: "Análise com IA",
    description: "Algoritmos avançados analisam milhares de dados históricos e estatísticas.",
  },
  {
    icon: <Target className="h-10 w-10 text-primary-forbet" />,
    title: "Predições Precisas",
    description: "Taxa de acerto de 87% com percentual de confiança para cada predição.",
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-primary-forbet" />,
    title: "Acompanhamento Real",
    description: "Jogos ao vivo com dados atualizados e resultados instantâneos.",
  },
  {
    icon: <Zap className="h-10 w-10 text-primary-forbet" />,
    title: "Dashboard Inteligente",
    description: "Suas estatísticas, ROI e performance em um só lugar.",
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary-forbet" />,
    title: "Apostas Responsáveis",
    description: "Promovemos a gestão de risco e o controle de banca.",
  },
  {
    icon: <Award className="h-10 w-10 text-primary-forbet" />,
    title: "Tecnologia de Ponta",
    description: "IA proprietária e atualizações constantes dos algoritmos.",
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-hero-pattern bg-cover bg-center py-20 text-white md:py-32">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="container relative z-10 mx-auto text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">ForBet.AI</h1>
            <p className="mb-8 text-lg text-slate-200 md:text-xl">
              Predições Esportivas Inteligentes para Futebol. Transforme sorte em estratégia.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="bg-primary-forbet hover:bg-primary-forbet/90 text-white">
                <Link href="/dashboard">Começar Agora</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="#features">Saiba Mais</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto text-center">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="rounded-lg bg-card p-8 shadow-lg">
                <h3 className="text-5xl font-bold text-primary-forbet">87%</h3>
                <p className="mt-2 text-muted-foreground">Precisão nas Predições</p>
              </div>
              <div className="rounded-lg bg-card p-8 shadow-lg">
                <h3 className="text-5xl font-bold text-accent-forbet">50.000+</h3>
                <p className="mt-2 text-muted-foreground">Predições Realizadas</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto">
            <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">Funcionalidades Poderosas</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center transition-all hover:shadow-xl hover:scale-105">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-forbet/10">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-primary-forbet to-secondary-forbet text-white">
          <div className="container mx-auto text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">Pronto para Elevar suas Apostas?</h2>
            <p className="mb-8 text-lg text-slate-200">
              Junte-se à ForBet.AI e comece a tomar decisões baseadas em dados.
            </p>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary-forbet"
            >
              <Link href="/sign-up">Criar Conta Gratuita</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t py-8 text-center">
        <div className="container mx-auto">
          <div className="mb-4 flex justify-center space-x-6">
            <Link href="/termos" className="text-sm text-muted-foreground hover:text-primary-forbet">
              Termos de Serviço
            </Link>
            <Link href="/privacidade" className="text-sm text-muted-foreground hover:text-primary-forbet">
              Política de Privacidade
            </Link>
            <Link href="/contato" className="text-sm text-muted-foreground hover:text-primary-forbet">
              Contato
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ForBet.AI. Todos os direitos reservados.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            A ForBet.AI promove apostas responsáveis. Aposte com consciência.
          </p>
        </div>
      </footer>
    </div>
  )
}
