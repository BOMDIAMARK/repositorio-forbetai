"use client"

import Link from "next/link"
import { ThemeSwitcher } from "@/components/theme-switcher"
// Removido: import { LogIn } from 'lucide-react'
import { ForBetLogo } from "./icons"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <ForBetLogo className="h-8 w-8 text-primary-forbet" />
          <span className="font-bold sm:inline-block">ForBet.AI</span>
        </Link>
        <nav className="hidden flex-1 items-center space-x-4 md:flex">
          {/* Adicione links de navegação pública aqui se necessário */}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2 md:flex-none">
          <ThemeSwitcher />
          {/* Elementos de autenticação do Clerk removidos */}
          {/* Você pode adicionar novos botões de login/cadastro aqui se implementar outra solução */}
          {/* Exemplo:
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild size="sm" className="bg-primary-forbet hover:bg-primary-forbet/90 text-white">
            <Link href="/cadastro">Cadastrar</Link>
          </Button>
          */}
        </div>
      </div>
    </header>
  )
}
