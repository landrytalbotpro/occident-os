import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui";
import { ClientList } from "@/features/clients/components/ClientList";

export const metadata: Metadata = { title: "Clientes" };

async function List({ searchParams }: { searchParams: PageProps<"/crm/clients">["searchParams"] }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 60) : undefined;
  return <ClientList q={q} />;
}

export default function ClientsPage(props: PageProps<"/crm/clients">) {
  return (
    <>
      <PageHeader title="Clientes" description="Personas y empresas con pólizas cerradas contigo" />
      <Suspense
        fallback={<div className="bg-surface-2 h-80 animate-pulse rounded-md motion-reduce:animate-none" />}
      >
        <List searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
