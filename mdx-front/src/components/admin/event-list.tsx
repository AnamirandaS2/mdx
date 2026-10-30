"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/brand/page-header";
import { formatWhen, statusLabel } from "@/components/admin/event-format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  duplicarEvento,
  encerrarEvento,
  listarEventos,
  publicarEvento,
  type AdminEvent,
} from "@/server/events";
import { canCreateEvent, type AuthUser } from "@/server/permissions";

export function EventList() {
  const router = useRouter();
  const { data } = useSession();
  const [events, setEvents] = useState<AdminEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const sessionUser: AuthUser | null =
    data?.user?.id && data.user.role
      ? {
          id: data.user.id,
          role: data.user.role,
          memberships: data.user.memberships ?? [],
        }
      : null;

  async function reload() {
    const result = await listarEventos();
    if (!result.ok) {
      setError(result.message);
      setEvents([]);
      return;
    }
    setEvents(result.data);
  }

  useEffect(() => {
    let cancelled = false;
    void listarEventos().then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setError(result.message);
        setEvents([]);
        return;
      }
      setEvents(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function run(eventId: string, action: "duplicar" | "publicar" | "encerrar") {
    setPending(eventId);
    setNotice(null);
    const result =
      action === "duplicar"
        ? await duplicarEvento(eventId)
        : action === "publicar"
          ? await publicarEvento(eventId)
          : await encerrarEvento(eventId);
    setPending(null);
    if (!result.ok) {
      setNotice(result.blockers?.join(" ") || result.message);
      return;
    }
    if (action === "duplicar") {
      router.push(`/admin/eventos/${result.data.id}`);
      return;
    }
    await reload();
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader
          title="Eventos"
          description="Rascunhos, publicação e a equipe de cada encontro."
        />
        {canCreateEvent(sessionUser) ? (
          <Button nativeButton={false} render={<Link href="/admin/eventos/novo" />}>
            Novo evento
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-brand-pink-dark">{error}</p> : null}
      {notice ? (
        <p role="alert" className="text-sm text-brand-pink-dark">
          {notice}
        </p>
      ) : null}
      <Card className="shadow-md">
        <CardContent>
          {events === null ? <p>Carregando eventos…</p> : null}
          {events?.length === 0 ? <p>Nenhum evento por aqui ainda.</p> : null}
          {events && events.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Datas</TableHead>
                  <TableHead>Inscritos</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-brand-purple">/e/{event.slug}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={event.status === "PUBLISHED" ? "default" : "outline"}>
                        {statusLabel[event.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatWhen(event.startsAt, event.endsAt)}</TableCell>
                    <TableCell>{event.registrationCount}</TableCell>
                    <TableCell>
                      {event.canManage ? (
                        <div className="flex flex-col items-start gap-2">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              nativeButton={false}
                              render={<Link href={`/admin/eventos/${event.id}`} />}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={pending === event.id}
                              onClick={() => void run(event.id, "duplicar")}
                            >
                              Duplicar
                            </Button>
                            {event.status === "DRAFT" ? (
                              <Button
                                size="sm"
                                disabled={pending === event.id || event.publishBlockers.length > 0}
                                onClick={() => void run(event.id, "publicar")}
                              >
                                Publicar
                              </Button>
                            ) : null}
                            {event.status === "PUBLISHED" ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={pending === event.id}
                                onClick={() => void run(event.id, "encerrar")}
                              >
                                Encerrar
                              </Button>
                            ) : null}
                          </div>
                          {event.status === "DRAFT" && event.publishBlockers[0] ? (
                            <p className="max-w-56 text-xs text-brand-pink-dark">
                              {event.publishBlockers[0]}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-brand-purple">Só consulta</p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
