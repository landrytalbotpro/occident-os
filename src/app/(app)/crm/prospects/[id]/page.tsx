import type { Metadata } from "next";
import { Suspense } from "react";
import { z } from "zod";
import { notFound } from "next/navigation";
import { ProspectDetail, ProspectDetailFallback } from "@/features/prospects/components/ProspectDetail";

export const metadata: Metadata = { title: "Prospect" };

async function Detail({ params }: { params: PageProps<"/crm/prospects/[id]">["params"] }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  return <ProspectDetail id={id} />;
}

export default function ProspectPage(props: PageProps<"/crm/prospects/[id]">) {
  return (
    <Suspense fallback={<ProspectDetailFallback />}>
      <Detail params={props.params} />
    </Suspense>
  );
}
