import type { Metadata } from "next";
import { Users } from "lucide-react";
import { Button, EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Prospects" };

export default function Page() {
  return (
    <>
      <PageHeader
        title="Prospects"
        actions={
          <Button disabled title="Disponible en la etapa 3">
            Nuevo prospect
          </Button>
        }
      />
      <EmptyState
        icon={Users}
        title="Todavía no hay prospects"
        text="Aquí aparecerán las personas y empresas que estás trabajando, con su etapa y su próximo paso."
      />
    </>
  );
}
