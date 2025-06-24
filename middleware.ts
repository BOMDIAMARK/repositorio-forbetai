import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware placeholder - não faz nada relacionado à autenticação agora
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Ajuste este matcher conforme necessário se você mantiver o middleware
    // Por enquanto, ele corresponde a todas as rotas exceto arquivos estáticos e _next
    "/((?!_next|[^?]*.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
