import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Cadastrar",
};

export default function CadastrarPage() {
  return (
    <AuthCard
      title="Cadastrar"
      description="A conta nova entra como participante. Quem organiza um evento recebe o papel dentro dele."
    >
      <RegisterForm />
    </AuthCard>
  );
}
