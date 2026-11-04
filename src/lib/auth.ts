import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = { id: string; email: string };

/**
 * Comprobación de sesión EN EL SERVIDOR (además del proxy).
 * Devuelve un usuario mínimo o redirige a /login.
 */
export async function requireUser(): Promise<CurrentUser> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) redirect("/login");
  return { id: claims.sub, email: (claims.email as string | undefined) ?? "" };
}
