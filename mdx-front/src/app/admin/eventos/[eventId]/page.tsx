import type { Metadata } from "next";
import { Suspense } from "react";
import { EventEditorRoute } from "@/components/admin/event-editor";

export const metadata: Metadata = {
  title: "Editar evento",
};

export default function EditarEventoPage() {
  return (
    <Suspense fallback={<main className="px-4 py-10">Carregando o evento…</main>}>
      <EventEditorRoute />
    </Suspense>
  );
}
