import type { Metadata } from "next";
import { NewEventForm } from "@/components/admin/event-editor";

export const metadata: Metadata = {
  title: "Novo evento",
};

export default function NovoEventoPage() {
  return <NewEventForm />;
}
