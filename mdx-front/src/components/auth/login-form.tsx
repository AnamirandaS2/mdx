"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      redirect: false,
    });
    setPending(false);

    if (result?.code === "rate_limit") {
      setError("Muitas tentativas. Espere alguns minutos e tente de novo.");
      return;
    }
    if (result?.error) {
      setError("E-mail ou senha incorretos.");
      return;
    }

    const callback = params.get("callbackUrl") ?? "/conta";
    router.push(callback.startsWith("/") ? callback : "/conta");
    router.refresh();
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={error ? true : undefined}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          Senha
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          aria-invalid={error ? true : undefined}
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-brand-pink-dark">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
      <p className="text-sm text-brand-purple">
        <Link href="/esqueci-senha" className="underline-offset-4 hover:underline">
          Esqueci a senha
        </Link>
        {" · "}
        <Link href="/cadastrar" className="underline-offset-4 hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
