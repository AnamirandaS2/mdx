"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { atualizarInscricao } from "@/server/actions";
import { Button } from "@/components/ui/button";

export function ContaPainel() {
  const { data } = useSession();
  const [message, setMessage] = useState<string | null>(null);
  const user = data?.user;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user?.id) return;
    const result = await atualizarInscricao(user.id);
    setMessage(
      result.ok
        ? "Inscrição atualizada."
        : "Não foi possível alterar essa inscrição.",
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p>{user?.name ? `Olá, ${user.name}.` : "Carregando sua conta…"}</p>
      <p className="text-brand-purple">{user?.email}</p>
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <p className="text-sm">
          Aqui ficam as suas inscrições. Só é possível alterar as que estão no seu nome.
        </p>
        <Button type="submit" disabled={!user?.id}>
          Atualizar minha inscrição
        </Button>
      </form>
      {message ? <p role="status">{message}</p> : null}
    </div>
  );
}
