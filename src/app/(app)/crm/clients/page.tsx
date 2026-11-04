import type { Metadata } from "next";
import { UserCheck } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Clientes" };

export default function Page() {
  return (
    <>
      <PageHeader title="Clientes" />
      <EmptyState
        icon={UserCheck}
        title="Todavía no hay clientes"
        text="Un prospect pasa a cliente cuando cierras su primera póliza."
      />
    </>
  );
}
