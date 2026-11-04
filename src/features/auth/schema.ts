import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "Introduce un email válido" }).trim(),
  password: z.string().min(1, { error: "Introduce tu contraseña" }),
});

export type LoginState = {
  error?: string;
  fieldErrors?: Partial<Record<"email" | "password", string>>;
  email?: string;
};
