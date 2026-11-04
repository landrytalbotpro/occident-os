"use client";

import { useActionState } from "react";
import { Button, Input, Label } from "@/components/ui";
import { signIn } from "../actions";
import type { LoginState } from "../schema";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.error && (
        <p role="alert" className="bg-danger/10 text-danger rounded-sm px-3 py-2">
          {state.error}
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email}
          invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          required
        />
        {state.fieldErrors?.email && (
          <p id="email-error" className="text-danger text-xs">
            {state.fieldErrors.email}
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
          required
        />
        {state.fieldErrors?.password && (
          <p id="password-error" className="text-danger text-xs">
            {state.fieldErrors.password}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full" loading={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
