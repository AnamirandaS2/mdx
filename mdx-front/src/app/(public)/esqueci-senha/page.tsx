import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Esqueci a senha",
};

export default function EsqueciSenhaPage() {
  return (
    <AuthCard
      title="Esqueci a senha"
      description="A tela já está pronta. O e-mail com o link ainda não é enviado."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
