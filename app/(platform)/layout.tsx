import type React from "react"
import { PlatformHeader } from "@/components/platform-header"
import { PlatformSidebar } from "@/components/platform-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar" // Assuming you've added shadcn sidebar

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Using shadcn sidebar provider if you plan to use its collapsible features
    // Otherwise, a simpler div structure would work.
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <PlatformSidebar />
        <div className="flex flex-col">
          <PlatformHeader /> {/* Pass onMenuClick if sidebar is controlled by header on mobile */}
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/20">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
