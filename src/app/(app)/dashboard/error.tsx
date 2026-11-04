"use client";

import { Button, EmptyState } from "@/components/ui";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="No se ha podido cargar el inicio"
      text="Puede ser un problema de conexión con la base de datos. Prueba otra vez en unos segundos."
      action={
        <Button variant="secondary" onClick={reset}>
          Reintentar
        </Button>
      }
    />
  );
}
