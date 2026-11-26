import { CalendarClock } from "lucide-react";
import { Card } from "@/components/ui";
import { localDate } from "@/lib/dates";
import { listRenewals } from "../queries";
import { RenewalForm } from "./RenewalForm";
import { RenewalRow } from "./RenewalRow";

function Title() {
  return (
    <h2 className="text-strong mb-1 flex items-center gap-2 text-base leading-6 font-semibold">
      <CalendarClock className="text-muted size-4" aria-hidden />
      Vencimientos
    </h2>
  );
}

/**
 * Bloque «Vencimientos» de la ficha de prospect y de cliente.
 * Los vencimientos cuelgan siempre del prospect (el cliente se enlaza por prospect_id).
 */
export async function RenewalsBlock({ prospectId }: { prospectId: string | null }) {
  if (!prospectId) {
    return (
      <Card>
        <Title />
        <p className="text-muted">
          Este cliente no viene de un prospect, así que no se pueden registrar vencimientos.
        </p>
      </Card>
    );
  }

  const items = await listRenewals(prospectId);
  const used = items.map((r) => r.product);
  const today = localDate();

  return (
    <Card>
      <Title />
      <p className="text-muted mb-1 text-xs leading-4">
        Mes en que vencen sus seguros en otras compañías. Te avisamos 90 días antes.
      </p>
      {items.length === 0 ? (
        <p className="text-muted py-3">Sin vencimientos registrados.</p>
      ) : (
        <ul className="divide-border divide-y">
          {items.map((r) => (
            <RenewalRow key={r.id} renewal={r} prospectId={prospectId} usedProducts={used} today={today} />
          ))}
        </ul>
      )}
      <div className="border-border mt-1 border-t pt-3">
        <RenewalForm prospectId={prospectId} usedProducts={used} />
      </div>
    </Card>
  );
}
