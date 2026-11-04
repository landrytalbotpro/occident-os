import { AppShell } from "@/components/layout/AppShell";

// Etapa 2: aquí se comprobará la sesión en el servidor.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
