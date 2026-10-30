"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {sent ? (
        <p role="status" className="text-sm">
          O envio de e-mail ainda não está ligado. Quando estiver, o link de
          redefinição chega nesta caixa.
        </p>
      ) : (
        <p className="text-sm text-brand-purple">
          Informe o e-mail da conta. O link de redefinição entra numa próxima etapa.
        </p>
      )}
      <Button type="submit">Pedir redefinição</Button>
      <p className="text-sm text-brand-purple">
        <Link href="/entrar" className="underline-offset-4 hover:underline">
          Voltar para entrar
        </Link>
      </p>
    </form>
  );
}
