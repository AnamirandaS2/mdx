import type { Metadata } from "next";
import { Suspense } from "react";
import { EventList } from "@/components/admin/event-list";

export const metadata: Metadata = {
  title: "Eventos",
};

export default function EventosPage() {
  return (
    <Suspense fallback={<main className="px-4 py-10">Carregando eventos…</main>}>
      <EventList />
    </Suspense>
  );
}
