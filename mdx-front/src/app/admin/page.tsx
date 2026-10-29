import type { Metadata } from "next";
import { PageHeader } from "@/components/brand/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Painel",
};

export default function AdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <PageHeader
        title="Painel"
        description="A barra lateral recolhe e abre pelo teclado. O restante do painel entra aqui."
      />
      <Card className="shadow-md">
        <CardContent>
          <p>
            Use Tab para chegar no menu e Enter ou Espaço no botão de recolher.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
