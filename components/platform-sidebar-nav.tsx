"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, CalendarClock, Home, LineChart, Settings, ShieldQuestion, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  disabled?: boolean
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/predicoes", label: "Predições", icon: CalendarClock },
  { href: "/ao-vivo", label: "Ao Vivo", icon: BarChart3 },
  { href: "/analises", label: "Análises", icon: LineChart },
  { href: "/perfil", label: "Meu Perfil", icon: UserCircle },
  { href: "/suporte", label: "Suporte", icon: ShieldQuestion, disabled: true },
  { href: "/configuracoes", label: "Configurações", icon: Settings, disabled: true },
]

export function PlatformSidebarNav({
  isMobile = false,
  isCollapsed = false,
}: { isMobile?: boolean; isCollapsed?: boolean }) {
  const pathname = usePathname()

  if (isCollapsed && !isMobile) {
    return (
      <TooltipProvider>
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: pathname === item.href ? "default" : "ghost", size: "icon" }),
                    "h-9 w-9",
                    pathname === item.href &&
                      "bg-primary-forbet text-primary-foreground hover:bg-primary-forbet/90 hover:text-primary-foreground",
                    item.disabled && "pointer-events-none opacity-50",
                  )}
                  aria-disabled={item.disabled}
                  tabIndex={item.disabled ? -1 : undefined}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
    )
  }

  return (
    <nav className={cn("grid gap-1", isMobile ? "px-4" : "px-2")}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: pathname === item.href ? "default" : "ghost", size: "sm" }),
            "justify-start",
            pathname === item.href &&
              "bg-primary-forbet text-primary-foreground hover:bg-primary-forbet/90 hover:text-primary-foreground",
            item.disabled && "pointer-events-none opacity-50",
          )}
          aria-disabled={item.disabled}
          tabIndex={item.disabled ? -1 : undefined}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
