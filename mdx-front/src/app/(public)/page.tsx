import { Suspense } from "react";
import { PageHeader } from "@/components/brand/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApiUrl, getHealth } from "@/lib/api";

async function HealthBody() {
  const health = await getHealth();

  return (
    <CardContent className="flex flex-col gap-2">
      <p className="text-base font-medium">
        {health.ok ? "API no ar" : "API fora"}
      </p>
      <p className="text-brand-purple">
        {health.ok
          ? `Postgres: ${health.database}`
          : "Não foi possível consultar o health check."}
      </p>
    </CardContent>
  );
}

export default function Home() {
  const apiUrl = getApiUrl();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <PageHeader
        title="Mermãs Digitais"
        description="O começo do MDX: uma API e um front no mesmo lugar, com a cara da casa."
      />
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle>Status da API</CardTitle>
          <CardDescription>Consulta ao health check do Nest.</CardDescription>
        </CardHeader>
        <Suspense
          fallback={
            <CardContent>
              <p className="text-brand-purple">Consultando a API...</p>
            </CardContent>
          }
        >
          <HealthBody />
        </Suspense>
        <CardFooter className="flex-col items-start gap-3">
          <p className="text-brand-purple">{apiUrl}</p>
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <a href={`${apiUrl}/api/docs`} target="_blank" rel="noreferrer" />
            }
          >
            Abrir Swagger
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
