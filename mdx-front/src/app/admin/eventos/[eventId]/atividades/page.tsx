import type { Metadata } from "next";
import { Suspense } from "react";
import { ActivityBoardRoute } from "@/components/admin/activity-board";

export const metadata: Metadata = {
  title: "Atividades",
};

export default function AtividadesPage() {
  return (
    <Suspense fallback={<main className="px-4 py-10">Carregando a programação…</main>}>
      <ActivityBoardRoute />
    </Suspense>
  );
}
