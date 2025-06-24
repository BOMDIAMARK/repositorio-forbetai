"use client"

import Link from "next/link"
// Removido: import { UserButton } from "@clerk/nextjs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ForBetLogo } from "./icons"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { PlatformSidebarNav } from "./platform-sidebar-nav"

export function PlatformHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center md:hidden">
        {onMenuClick ? (
          <Button variant="outline" size="icon" onClick={onMenuClick} className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        ) : (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu de navegação</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                  <ForBetLogo className="h-6 w-6 text-primary-forbet" />
                  <span>ForBet.AI</span>
                </Link>
              </div>
              <nav className="flex-1 overflow-auto py-4">
                <PlatformSidebarNav isMobile={true} />
              </nav>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <div className="hidden md:flex md:items-center md:gap-2">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <ForBetLogo className="h-6 w-6 text-primary-forbet" />
          <span className="text-lg">ForBet.AI</span>
        </Link>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notificações</span>
        </Button>
        {/* UserButton removido */}
        {/* Se você tiver um novo sistema de autenticação, o ícone do usuário/menu iria aqui */}
      </div>
    </header>
  )
}
