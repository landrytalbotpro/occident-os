import type { Metadata } from "next";
import { Suspense } from "react";
import { z } from "zod";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { ProspectForm } from "@/features/prospects/components/ProspectForm";
import { getProspect, listLeadSources } from "@/features/prospects/queries";
import { isoToMadridLocal } from "@/lib/dates";

export const metadata: Metadata = { title: "Editar prospect" };

async function Form({ params }: { params: PageProps<"/crm/prospects/[id]/editar">["params"] }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [p, leadSources] = await Promise.all([getProspect(id), listLeadSources()]);
  if (!p) notFound();
  return (
    <>
      <PageHeader title={`Editar · ${p.full_name}`} />
      <ProspectForm
        id={p.id}
        leadSources={leadSources}
        cancelHref={`/crm/prospects/${p.id}`}
        defaults={{
          full_name: p.full_name,
          company_name: p.company_name ?? "",
          segment: p.segment,
          phone: p.phone ?? "",
          email: p.email ?? "",
          municipality: p.municipality ?? "",
          postal_code: p.postal_code ?? "",
          stage: p.stage,
          lost_reason: p.lost_reason ?? "",
          lead_source_id: p.lead_source_id ?? "",
          next_action_at: isoToMadridLocal(p.next_action_at),
          notes: p.notes ?? "",
          legal_basis: p.legal_basis,
          consent_source: p.consent_source ?? "",
          consent_given: Boolean(p.consent_at),
        }}
      />
    </>
  );
}

export default function EditProspectPage(props: PageProps<"/crm/prospects/[id]/editar">) {
  return (
    <div className="mx-auto max-w-3xl">
      <Suspense
        fallback={<div className="bg-surface-2 h-96 animate-pulse rounded-md motion-reduce:animate-none" />}
      >
        <Form params={props.params} />
      </Suspense>
    </div>
  );
}
