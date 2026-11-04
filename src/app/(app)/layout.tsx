import { AppShell } from "@/components/layout/AppShell";

// La sesión se comprueba en el proxy y, además, en el servidor dentro de AppShell (AuthGate).
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
