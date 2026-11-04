import type { Metadata } from "next";
import { Card } from "@/components/ui";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = { title: "Entrar" };

// Si ya hay sesión, el proxy redirige a /dashboard.
export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="text-strong text-lg font-semibold tracking-wide">OCCIDENT OS</div>
          <p className="text-muted mt-1">Herramienta interna del agente</p>
        </div>
        <Card className="p-6">
          <LoginForm />
        </Card>
      </div>
    </main>
  );
}
