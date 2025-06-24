"use client"

import { Toaster as SonnerToaster, type ToasterProps } from "sonner"

/**
 * Wrapper do componente Toaster do pacote `sonner`, seguindo
 * a convenção de pastas do shadcn/ui (`@/components/ui/*`).
 *
 * Exemplo de uso:
 *   import { toast } from "sonner"
 *   toast.success("Olá, mundo!")
 */
export function Toaster(props: ToasterProps) {
  return <SonnerToaster {...props} />
}
