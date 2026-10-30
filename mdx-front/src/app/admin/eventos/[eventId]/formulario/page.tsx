import type { Metadata } from "next";
import { Suspense } from "react";
import { FormBuilderRoute } from "@/components/admin/form-builder";

export const metadata: Metadata = {
  title: "Formulário",
};

export default function FormularioPage() {
  return (
    <Suspense fallback={<main className="px-4 py-10">Carregando o formulário…</main>}>
      <FormBuilderRoute />
    </Suspense>
  );
}
