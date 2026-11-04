import type { Metadata } from "next";
import { Button, Card, Input, Label } from "@/components/ui";

export const metadata: Metadata = { title: "Entrar" };

// Solo UI. La lógica de Supabase llega en la etapa 2.
export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="text-strong text-lg font-semibold tracking-wide">OCCIDENT OS</div>
          <p className="text-muted mt-1">Herramienta interna del agente</p>
        </div>
        <Card className="p-6">
          <form className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
