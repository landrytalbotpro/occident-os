import "server-only";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Cliente de datos para Server Components. Siempre en tiempo de petición
 * (los datos dependen del usuario y la RLS los filtra por su sesión).
 */
export async function db() {
  await connection();
  return createClient();
}
