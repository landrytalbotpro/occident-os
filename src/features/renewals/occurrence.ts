/**
 * Cálculo de la próxima ocurrencia de un vencimiento (lógica pura, sin dependencias).
 *
 * Regla: el vencimiento cae el día 1 del mes indicado, este año o el siguiente.
 * El MES EN CURSO cuenta como «todavía no pasado»: si hoy es 26 de noviembre y el
 * vencimiento es en noviembre, la ocurrencia es el 1 de noviembre de este año
 * (días restantes negativos = ya ha empezado y sigue pendiente de llamar).
 * Así no se pierde un vencimiento del mes en curso sin tratar.
 */

/** Fecha civil en hora de Madrid. month: 1-12. */
export type YMD = { year: number; month: number; day: number };

export const DUE_WINDOW_DAYS = 90;

const DAY_MS = 86_400_000;

export function parseYMD(ymd: string): YMD {
  const [year, month, day] = ymd.split("-").map(Number);
  return { year, month, day };
}

/** Días entre dos fechas civiles (b - a). */
function daysBetween(a: YMD, b: YMD): number {
  return Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / DAY_MS);
}

export type Occurrence = { year: number; month: number; date: string; daysUntil: number };

function occurrenceIn(year: number, month: number, today: YMD): Occurrence {
  const first: YMD = { year, month, day: 1 };
  return {
    year,
    month,
    date: `${year}-${String(month).padStart(2, "0")}-01`,
    daysUntil: daysBetween(today, first),
  };
}

/** Ocurrencia vigente: 1 del mes, este año si el mes es el actual o posterior; si no, el año siguiente. */
export function currentOccurrence(month: number, today: YMD): Occurrence {
  const year = month >= today.month ? today.year : today.year + 1;
  return occurrenceIn(year, month, today);
}

/** Próxima ocurrencia PENDIENTE: si la vigente ya está tratada, la del año siguiente. */
export function pendingOccurrence(month: number, handledYear: number | null, today: YMD): Occurrence {
  const occ = currentOccurrence(month, today);
  return handledYear === occ.year ? occurrenceIn(occ.year + 1, month, today) : occ;
}

/** ¿Hay que llamar? Ocurrencia vigente dentro de la ventana y todavía no tratada. */
export function isDue(
  month: number,
  handledYear: number | null,
  today: YMD,
  windowDays: number = DUE_WINDOW_DAYS,
): boolean {
  const occ = currentOccurrence(month, today);
  return occ.daysUntil <= windowDays && handledYear !== occ.year;
}
