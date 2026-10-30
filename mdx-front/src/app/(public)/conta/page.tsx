import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ContaPainel } from "@/components/auth/conta-painel";

export const metadata: Metadata = {
  title: "Minha conta",
};

export default function ContaPage() {
  return (
    <AuthCard
      title="Minha conta"
      description="Suas inscrições ficam aqui. Outra pessoa não altera o que é seu."
    >
      <ContaPainel />
    </AuthCard>
  );
}
