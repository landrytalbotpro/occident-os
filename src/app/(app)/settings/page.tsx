import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Ajustes" };

export default function Page() {
  return (
    <>
      <PageHeader title="Ajustes" />
      <EmptyState
        icon={Settings}
        title="Ajustes"
        text="Perfil, objetivos del periodo y fuentes de captación. Disponible en próximas etapas."
      />
    </>
  );
}
