import type { Metadata } from "next";
import { Package } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Catálogo" };

export default function Page() {
  return (
    <>
      <PageHeader title="Catálogo" />
      <EmptyState
        icon={Package}
        title="Catálogo vacío"
        text="Solo productos y textos aprobados por la entidad. Se cargará con datos ficticios en la etapa 3."
      />
    </>
  );
}
