import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui";
import { ProspectForm } from "@/features/prospects/components/ProspectForm";
import { listLeadSources } from "@/features/prospects/queries";

export const metadata: Metadata = { title: "Nuevo prospect" };

async function Form() {
  const leadSources = await listLeadSources();
  return (
    <ProspectForm
      defaults={{ stage: "nuevo", segment: "particular", legal_basis: "consentimiento" }}
      leadSources={leadSources}
      cancelHref="/crm/prospects"
    />
  );
}

export default function NewProspectPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Nuevo prospect" />
      <Suspense
        fallback={<div className="bg-surface-2 h-96 animate-pulse rounded-md motion-reduce:animate-none" />}
      >
        <Form />
      </Suspense>
    </div>
  );
}
