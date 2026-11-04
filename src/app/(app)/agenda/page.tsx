import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { Button, EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Agenda" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Agenda"
        actions={
          <Button disabled title="Disponible en la etapa 3">
            Nueva cita
          </Button>
        }
      />
      <EmptyState
        icon={CalendarDays}
        title="No hay citas programadas"
        text="Tus visitas y llamadas con hora aparecerán aquí."
      />
    </>
  );
}
