import { NextResponse } from "next/server"

const BASE_URL = process.env.SPORTMONKS_BASE_URL ?? "https://api.sportmonks.com/v3"
const API_KEY = process.env.SPORTMONKS_API_KEY // ⚠️ nunca prefixe com NEXT_PUBLIC aqui

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ 
      error: "API key missing.",
      data: []
    }, { status: 500 })
  }

  const includes = "league;participants;scores;state;periods.type"
  const url = `${BASE_URL}/football/livescores/inplay?include=${includes}&api_token=${API_KEY}`

  try {
    const res = await fetch(url, { next: { revalidate: 15 } })
    if (!res.ok) {
      const body = await res.text()
      return NextResponse.json({ 
        error: body,
        data: []
      }, { status: res.status })
    }
    const apiResponse = await res.json()
    
    // Garantir que sempre retornamos um formato consistente
    return NextResponse.json({
      data: apiResponse.data || [],
      meta: apiResponse.meta || {},
      success: true
    }, { status: 200 })
    
  } catch (err) {
    console.error("Erro na API de live scores:", err)
    return NextResponse.json({ 
      error: "Failed to fetch live scores.",
      data: []
    }, { status: 500 })
  }
}
