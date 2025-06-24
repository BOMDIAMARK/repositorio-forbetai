import type { UpcomingFixtureForAnalysis } from "./types"

export const mockUpcomingFixtures: UpcomingFixtureForAnalysis[] = [
  {
    id: 19387026, // ID real para teste
    name: "Flamengo vs Palmeiras",
    leagueName: "Brasileirão Série A",
    leagueLogo: "/placeholder.svg?width=24&height=24",
    teamALogo: "/placeholder.svg?width=32&height=32",
    teamBLogo: "/placeholder.svg?width=32&height=32",
    matchDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Em 3 dias
  },
  {
    id: 19387027, // ID fictício
    name: "Corinthians vs São Paulo",
    leagueName: "Copa do Brasil",
    leagueLogo: "/placeholder.svg?width=24&height=24",
    teamALogo: "/placeholder.svg?width=32&height=32",
    teamBLogo: "/placeholder.svg?width=32&height=32",
    matchDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Em 5 dias
  },
  {
    id: 19387028, // ID fictício
    name: "Atlético Mineiro vs Grêmio",
    leagueName: "Libertadores",
    leagueLogo: "/placeholder.svg?width=24&height=24",
    teamALogo: "/placeholder.svg?width=32&height=32",
    teamBLogo: "/placeholder.svg?width=32&height=32",
    matchDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Em 2 dias
  },
  {
    id: 19387029, // ID fictício
    name: "Manchester City vs Liverpool",
    leagueName: "Premier League",
    leagueLogo: "/placeholder.svg?width=24&height=24",
    teamALogo: "/placeholder.svg?width=32&height=32",
    teamBLogo: "/placeholder.svg?width=32&height=32",
    matchDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Em 7 dias
  },
]
