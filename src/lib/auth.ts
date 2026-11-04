import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = { id: string; email: string };

/**
 * Comprobación de sesión EN EL SERVIDOR (además del proxy).
 * Devuelve un usuario mínimo o redirige a /login.
 */
export async function requireUser(): Promise<CurrentUser> {
  // La sesión es por petición: nunca se prerenderiza (Supabase usa la hora actual al validar el token).
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) redirect("/login");
  return { id: claims.sub, email: (claims.email as string | undefined) ?? "" };
}
