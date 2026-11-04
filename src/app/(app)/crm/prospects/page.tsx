import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { ProspectList, ProspectListFallback } from "@/features/prospects/components/ProspectList";
import { STAGES, type Stage } from "@/features/prospects/schema";

export const metadata: Metadata = { title: "Prospects" };

async function List({ searchParams }: { searchParams: PageProps<"/crm/prospects">["searchParams"] }) {
  const sp = await searchParams;
  const etapa = typeof sp.etapa === "string" ? sp.etapa : undefined;
  const stage = STAGES.includes(etapa as Stage) ? (etapa as Stage) : undefined;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 60) : undefined;
  return <ProspectList stage={stage} q={q} />;
}

export default function ProspectsPage(props: PageProps<"/crm/prospects">) {
  return (
    <>
      <PageHeader
        title="Prospects"
        description="Personas y empresas con las que estás hablando"
        actions={
          <Link
            href="/crm/prospects/nuevo"
            className="bg-brand text-on-brand hover:bg-brand-hover inline-flex h-10 items-center gap-2 rounded-sm px-4 font-semibold"
          >
            <Plus className="size-4" aria-hidden />
            Nuevo prospect
          </Link>
        }
      />
      <Suspense fallback={<ProspectListFallback />}>
        <List searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}
