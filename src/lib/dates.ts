export const TZ = "Europe/Madrid";

/** Fecha YYYY-MM-DD en la zona del agente. */
export function localDate(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Desfase (ms) de la zona respecto a UTC en un instante dado. */
function tzOffsetMs(at: Date): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(
    +parts.year,
    +parts.month - 1,
    +parts.day,
    +parts.hour,
    +parts.minute,
    +parts.second,
  );
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

/** Inicio y fin (UTC ISO) del día local de hoy. */
export function todayRange(now: Date = new Date()) {
  const [y, m, d] = localDate(now).split("-").map(Number);
  const startGuess = new Date(Date.UTC(y, m - 1, d));
  const start = new Date(startGuess.getTime() - tzOffsetMs(startGuess));
  const endGuess = new Date(Date.UTC(y, m - 1, d + 1));
  const end = new Date(endGuess.getTime() - tzOffsetMs(endGuess));
  return { start: start.toISOString(), end: end.toISOString() };
}

const timeFmt = new Intl.DateTimeFormat("es-ES", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const dayFmt = new Intl.DateTimeFormat("es-ES", {
  timeZone: TZ,
  weekday: "short",
  day: "numeric",
  month: "short",
});
const shortDateFmt = new Intl.DateTimeFormat("es-ES", { timeZone: "UTC", day: "numeric", month: "short" });

export const formatTime = (iso: string) => timeFmt.format(new Date(iso));
export const formatDay = (iso: string) => dayFmt.format(new Date(iso));
/** Para columnas `date` (YYYY-MM-DD), sin desplazar por zona. */
export const formatDate = (ymd: string) => shortDateFmt.format(new Date(ymd + "T00:00:00Z"));

/** "YYYY-MM-DDTHH:mm" (hora de Madrid, como en <input type="datetime-local">) → ISO UTC. */
export function madridLocalToISO(local: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number);
  const guess = new Date(Date.UTC(y, mo - 1, d, h, mi));
  // Dos pasadas por si el cambio de hora cae entre medias
  let utc = guess.getTime() - tzOffsetMs(guess);
  utc = guess.getTime() - tzOffsetMs(new Date(utc));
  return new Date(utc).toISOString();
}

/** ISO UTC → "YYYY-MM-DDTHH:mm" en hora de Madrid (valor para datetime-local). */
export function isoToMadridLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const date = localDate(d);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);
  return `${date}T${time}`;
}

const dateTimeFmt = new Intl.DateTimeFormat("es-ES", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
export const formatDateTime = (iso: string) => dateTimeFmt.format(new Date(iso));
