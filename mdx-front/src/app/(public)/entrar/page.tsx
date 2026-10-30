import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function EntrarPage() {
  return (
    <AuthCard
      title="Entrar"
      description="Use o e-mail e a senha da sua conta para ver inscrições e o painel."
    >
      <Suspense fallback={<p>Carregando o formulário…</p>}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
