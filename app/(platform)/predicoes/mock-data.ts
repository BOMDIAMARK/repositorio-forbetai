import type { Prediction, League, Team } from "./types"
import { interMiamiVsPalmeirasAnalysis } from "./analysis-example-data" // Importar a análise detalhada

// Manter dados de ligas e times
export const mockLeagues: League[] = [
  { id: "bra_serie_a", name: "Brasileirão Série A" },
  { id: "copa_do_brasil", name: "Copa do Brasil" },
  { id: "libertadores", name: "Copa Libertadores" },
  { id: "mundial_clubes", name: "Mundial de Clubes FIFA" },
]

export const mockTeams: Team[] = [
  { id: "fla", name: "Flamengo" },
  { id: "pal", name: "Palmeiras" },
  { id: "cor", name: "Corinthians" },
  { id: "sao", name: "São Paulo" },
  { id: "inter_miami", name: "Inter Miami CF" },
]

// Novos dados mockados com a estrutura detalhada
export const mockPredictions: Prediction[] = [
  {
    id: "1",
    teamA: { name: "Inter Miami CF", logoUrl: "/placeholder.svg?width=40&height=40", shortName: "MIA" },
    teamB: { name: "Palmeiras", logoUrl: "/placeholder.svg?width=40&height=40", shortName: "PAL" },
    league: { name: "Mundial de Clubes FIFA", countryFlagUrl: "/placeholder.svg?width=20&height=20" },
    matchDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Amanhã
    confidence: 65, // Confiança no palpite principal (Palmeiras 2-1)
    result: { home: 30, draw: 30, away: 40 }, // Probabilidades para o resultado
    goals: { prediction: "Mais de 2.5", odds: 1.8 },
    corners: { prediction: "9-11 Escanteios", odds: 1.9 },
    cards: { prediction: "3-4 Cartões", odds: 2.8 },
    analysis: interMiamiVsPalmeirasAnalysis, // Usar a análise detalhada importada
    probabilities_over_time: {
      // Manter dados para o gráfico de detalhes
      home: [
        { time: 0, value: 30 },
        { time: 15, value: 32 },
        { time: 30, value: 35 },
        { time: 45, value: 33 },
        { time: 60, value: 38 },
        { time: 75, value: 36 },
        { time: 90, value: 40 },
      ],
      draw: [
        { time: 0, value: 30 },
        { time: 15, value: 29 },
        { time: 30, value: 28 },
        { time: 45, value: 29 },
        { time: 60, value: 27 },
        { time: 75, value: 28 },
        { time: 90, value: 25 },
      ],
      away: [
        { time: 0, value: 40 },
        { time: 15, value: 39 },
        { time: 30, value: 37 },
        { time: 45, value: 38 },
        { time: 60, value: 35 },
        { time: 75, value: 36 },
        { time: 90, value: 35 },
      ],
    },
  },
  // ... (outra predição mais simples para variedade)
  {
    id: "2",
    teamA: { name: "Flamengo", logoUrl: "/placeholder.svg?width=40&height=40", shortName: "FLA" },
    teamB: { name: "Corinthians", logoUrl: "/placeholder.svg?width=40&height=40", shortName: "COR" },
    league: { name: "Brasileirão Série A", countryFlagUrl: "/placeholder.svg?width=20&height=20" },
    matchDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Em 2 dias
    confidence: 78,
    result: { home: 55, draw: 25, away: 20 },
    goals: { prediction: "Mais de 1.5", odds: 1.65 },
    corners: { prediction: "Mais de 8.5", odds: 1.7 },
    cards: { prediction: "Menos de 5.5", odds: 1.95 },
    analysis: {
      // Análise mais simples para este jogo
      matchTitle: "Flamengo vs Corinthians",
      competitionDetails: "Brasileirão Série A - Rodada 15",
      executiveSummary: "Clássico nacional com favoritismo do Flamengo jogando em casa.",
      statisticalAnalysis: {
        /* ... preencher com dados mais simples ... */
      } as any, // Cast para simplificar
      dataDrivenBets: {
        totalGoals: { title: "Gols", prediction: "Mais de 1.5", justification: "Flamengo forte em casa." },
        mostLikelyResult: {
          title: "Resultado",
          prediction: "Flamengo Vence",
          justification: "Fator casa e melhor momento.",
        },
      },
      decisiveFactors: {
        teamA: { teamName: "Flamengo", advantages: ["Mando de campo", "Ataque forte"] },
        teamB: { teamName: "Corinthians", advantages: ["Defesa organizada", "Contra-ataque rápido"] },
      },
      probableScenarios: [
        {
          titleWithProbability: "CENÁRIO 1 (60%): FLAMENGO VENCE 2-0",
          details: ["Domínio do Flamengo", "Gols no segundo tempo"],
        },
      ],
      bettingRecommendations: [
        { title: "Principais", recommendations: [{ name: "Flamengo vence", oddsExample: "1.50" }] },
      ],
      conclusion: "Flamengo é favorito, mas Corinthians pode surpreender.",
    },
    probabilities_over_time: {
      home: [
        { time: 0, value: 55 },
        { time: 90, value: 60 },
      ],
      draw: [
        { time: 0, value: 25 },
        { time: 90, value: 22 },
      ],
      away: [
        { time: 0, value: 20 },
        { time: 90, value: 18 },
      ],
    },
  },
]
