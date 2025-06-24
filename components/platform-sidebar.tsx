"use client"

import type React from "react"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { ForBetLogo } from "./icons"
import { PlatformSidebarNav } from "./platform-sidebar-nav"

export function PlatformSidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("hidden border-r bg-muted/40 md:block", className)}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <ForBetLogo className="h-6 w-6 text-primary-forbet" />
            <span>ForBet.AI</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <PlatformSidebarNav />
        </div>
        {/* Optional: Add a footer to the sidebar */}
        {/* <div className="mt-auto p-4">
          <p className="text-xs text-muted-foreground">&copy; ForBet.AI</p>
        </div> */}
      </div>
    </div>
  )
}
