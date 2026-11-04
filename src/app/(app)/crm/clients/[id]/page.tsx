import type { Metadata } from "next";
import { Suspense } from "react";
import { z } from "zod";
import { notFound } from "next/navigation";
import { ClientDetail, ClientDetailFallback } from "@/features/clients/components/ClientDetail";

export const metadata: Metadata = { title: "Cliente" };

async function Detail({ params }: { params: PageProps<"/crm/clients/[id]">["params"] }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  return <ClientDetail id={id} />;
}

export default function ClientPage(props: PageProps<"/crm/clients/[id]">) {
  return (
    <Suspense fallback={<ClientDetailFallback />}>
      <Detail params={props.params} />
    </Suspense>
  );
}
