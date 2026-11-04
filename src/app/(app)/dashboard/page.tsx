import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui";
import { Objectives, ObjectivesFallback } from "@/features/dashboard/components/Objectives";
import { ListFallback, TodayAppointments, UpcomingTasks } from "@/features/dashboard/components/Today";

export const metadata: Metadata = { title: "Inicio" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Inicio" description="Tu día y el avance de tus objetivos" />

      <section aria-labelledby="kpis">
        <h2 id="kpis" className="sr-only">
          Objetivos
        </h2>
        <Suspense fallback={<ObjectivesFallback />}>
          <Objectives />
        </Suspense>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section>
          <h2 className="text-strong mb-3 text-base leading-6 font-semibold">Hoy</h2>
          <Suspense fallback={<ListFallback />}>
            <TodayAppointments />
          </Suspense>
        </section>
        <section>
          <h2 className="text-strong mb-3 text-base leading-6 font-semibold">Próximos seguimientos</h2>
          <Suspense fallback={<ListFallback />}>
            <UpcomingTasks />
          </Suspense>
        </section>
      </div>
    </>
  );
}
