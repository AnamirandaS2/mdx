"use client";

import { GripVertical } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/brand/page-header";
import {
  activityLabel,
  formatClock,
  formatDayLabel,
  fromLocalInput,
  toLocalInput,
} from "@/components/admin/event-format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  activitySchema,
  activityTypes,
  calendarDays,
  saoPauloDay,
  steamStands,
  zodFields,
  type ActivityType,
} from "@/server/event-schema";
import {
  atualizarAtividade,
  criarAtividade,
  criarStandsSteam,
  duplicarAtividade,
  obterEvento,
  removerAtividade,
  reordenarAtividades,
  type AdminEventDetail,
} from "@/server/events";

const selectClass =
  "h-11 w-full rounded-lg border border-input bg-white px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";

type Activity = AdminEventDetail["activities"][number];

type Draft = {
  id: string | null;
  title: string;
  description: string;
  type: ActivityType;
  locationId: string;
  startsAt: string;
  endsAt: string;
  responsible: string;
  capacity: string;
  requiresEnrollment: boolean;
  grantsStamp: boolean;
};

export function ActivityBoardRoute() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;
  const [event, setEvent] = useState<AdminEventDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void obterEvento(eventId).then((result) => {
      if (!active) return;
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setEvent(result.data);
    });
    return () => {
      active = false;
    };
  }, [eventId]);

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8">
        <p role="alert" className="text-brand-pink-dark">{error}</p>
      </main>
    );
  }
  if (!event) {
    return <main className="px-4 py-10">Carregando a programação…</main>;
  }
  return <ActivityBoard event={event} onChange={setEvent} />;
}

function ActivityBoard({
  event,
  onChange,
}: {
  event: AdminEventDetail;
  onChange: (event: AdminEventDetail) => void;
}) {
  const days = useMemo(() => {
    const listed = calendarDays(event.startsAt, event.endsAt);
    for (const activity of event.activities) {
      const day = saoPauloDay(activity.startsAt);
      if (!listed.includes(day)) listed.push(day);
    }
    return listed.sort();
  }, [event]);
  const [day, setDay] = useState(days[0] ?? "");
  const [view, setView] = useState<"grade" | "lista">("grade");
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(days[0] ?? ""));
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const selectedDay = days.includes(day) ? day : (days[0] ?? "");

  function edit(activity: Activity) {
    setDraft({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      type: activity.type,
      locationId: activity.locationId ?? "",
      startsAt: toLocalInput(activity.startsAt),
      endsAt: toLocalInput(activity.endsAt),
      responsible: activity.responsible,
      capacity: activity.capacity === null ? "" : String(activity.capacity),
      requiresEnrollment: activity.requiresEnrollment,
      grantsStamp: activity.grantsStamp,
    });
    setFields({});
    setMessage(null);
    document.getElementById("atividade-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function save(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const startsAt = fromLocalInput(draft.startsAt);
    const endsAt = fromLocalInput(draft.endsAt);
    const capacity = draft.capacity.trim() === "" ? null : Number(draft.capacity);
    const parsed = activitySchema.safeParse({
      title: draft.title,
      description: draft.description,
      type: draft.type,
      locationId: draft.locationId || null,
      startsAt,
      endsAt,
      responsible: draft.responsible,
      capacity,
      requiresEnrollment: draft.requiresEnrollment,
      grantsStamp: draft.grantsStamp,
    });
    if (!parsed.success) {
      setFields(zodFields(parsed.error));
      setMessage(null);
      return;
    }
    setPending(true);
    const input = parsed.data;
    const result = draft.id
      ? await atualizarAtividade(event.id, draft.id, input)
      : await criarAtividade(event.id, input);
    setPending(false);
    if (!result.ok) {
      setFields(result.fields ?? {});
      setMessage(result.fields?.endsAt || result.message);
      return;
    }
    onChange(result.data);
    setDraft(emptyDraft(selectedDay));
    setFields({});
    setMessage(draft.id ? "Atividade atualizada." : "Atividade adicionada.");
  }

  async function remove(activityId: string) {
    setPending(true);
    const result = await removerAtividade(event.id, activityId);
    setPending(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    if (draft.id === activityId) setDraft(emptyDraft(selectedDay));
    onChange(result.data);
    setMessage("Atividade removida.");
  }

  async function duplicate(activityId: string) {
    setPending(true);
    const result = await duplicarAtividade(event.id, activityId);
    setPending(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    onChange(result.data);
    setMessage("Atividade duplicada. Confira se o horário e o local continuam livres.");
  }

  async function steam() {
    setPending(true);
    const before = new Set(event.activities.map((item) => item.title));
    const result = await criarStandsSteam(event.id);
    setPending(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    onChange(result.data);
    const created = steamStands.filter((stand) => !before.has(stand.title)).length;
    setMessage(
      created === 0
        ? "Os stands STEAM já estavam na programação."
        : "Stands STEAM criados, cada um com carimbo.",
    );
  }

  async function dropOn(targetId: string) {
    const sourceId = dragging;
    setDragging(null);
    if (!sourceId || sourceId === targetId) return;
    const ids = moveBefore(event.activities.map((item) => item.id), sourceId, targetId);
    const previous = event;
    const byId = new Map(event.activities.map((item) => [item.id, item]));
    onChange({
      ...event,
      activities: ids.flatMap((id) => {
        const activity = byId.get(id);
        return activity ? [activity] : [];
      }),
    });
    const result = await reordenarAtividades(event.id, ids);
    if (!result.ok) {
      onChange(previous);
      setMessage(result.message);
      return;
    }
    onChange(result.data);
  }

  const locationName = new Map(event.locations.map((item) => [item.id, item.name]));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <PageHeader
        title="Programação"
        description={`${event.title}. A grade avisa quando duas atividades ocupam o mesmo local no mesmo horário.`}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button nativeButton={false} variant="outline" render={<Link href={`/admin/eventos/${event.id}?etapa=locais`} />}>
          Locais do evento
        </Button>
        <Button type="button" variant="secondary" onClick={() => void steam()} disabled={pending}>
          Criar stands STEAM
        </Button>
      </div>

      <Conflicts event={event} locationName={locationName} />

      <Card>
        <CardContent className="flex flex-col gap-4" id="atividade-form">
          <h2 className="font-heading text-xl text-brand-ink">
            {draft.id ? `Editar ${draft.title || "atividade"}` : "Nova atividade"}
          </h2>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={(formEvent) => void save(formEvent)}>
            <Field label="Título" htmlFor="activity-title" error={fields.title}>
              <Input
                id="activity-title"
                value={draft.title}
                onChange={(item) => setDraft({ ...draft, title: item.target.value })}
                required
              />
            </Field>
            <Field label="Tipo" htmlFor="activity-type" error={fields.type}>
              <select
                id="activity-type"
                className={selectClass}
                value={draft.type}
                onChange={(item) => setDraft({ ...draft, type: item.target.value as ActivityType })}
              >
                {activityTypes.map((item) => (
                  <option key={item} value={item}>{activityLabel[item]}</option>
                ))}
              </select>
            </Field>
            <Field label="Início" htmlFor="activity-start" error={fields.startsAt}>
              <Input
                id="activity-start"
                type="datetime-local"
                value={draft.startsAt}
                onChange={(item) => setDraft({ ...draft, startsAt: item.target.value })}
                required
              />
            </Field>
            <Field label="Fim" htmlFor="activity-end" error={fields.endsAt}>
              <Input
                id="activity-end"
                type="datetime-local"
                value={draft.endsAt}
                onChange={(item) => setDraft({ ...draft, endsAt: item.target.value })}
                required
              />
            </Field>
            <Field label="Local" htmlFor="activity-location" error={fields.locationId}>
              <select
                id="activity-location"
                className={selectClass}
                value={draft.locationId}
                onChange={(item) => setDraft({ ...draft, locationId: item.target.value })}
              >
                <option value="">Sem local</option>
                {event.locations.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Responsável" htmlFor="activity-owner" error={fields.responsible}>
              <Input
                id="activity-owner"
                value={draft.responsible}
                onChange={(item) => setDraft({ ...draft, responsible: item.target.value })}
                required
              />
            </Field>
            <Field label="Descrição" htmlFor="activity-description" error={fields.description} className="md:col-span-2">
              <Textarea
                id="activity-description"
                value={draft.description}
                onChange={(item) => setDraft({ ...draft, description: item.target.value })}
              />
            </Field>
            <Field label="Vagas" htmlFor="activity-capacity" error={fields.capacity} hint="Em branco, a atividade não tem limite.">
              <Input
                id="activity-capacity"
                inputMode="numeric"
                value={draft.capacity}
                onChange={(item) => setDraft({ ...draft, capacity: item.target.value })}
              />
            </Field>
            <div className="flex flex-col justify-end gap-3">
              <label className="flex items-center gap-2 text-sm" htmlFor="activity-enrollment">
                <input
                  id="activity-enrollment"
                  type="checkbox"
                  className="size-4 accent-[#EC4899]"
                  checked={draft.requiresEnrollment}
                  onChange={(item) => setDraft({ ...draft, requiresEnrollment: item.target.checked })}
                />
                Exige inscrição própria
              </label>
              <label className="flex items-center gap-2 text-sm" htmlFor="activity-stamp">
                <input
                  id="activity-stamp"
                  type="checkbox"
                  className="size-4 accent-[#EC4899]"
                  checked={draft.grantsStamp}
                  onChange={(item) => setDraft({ ...draft, grantsStamp: item.target.checked })}
                />
                Concede carimbo
              </label>
            </div>
            {message ? <p role="status" className="text-sm text-brand-purple md:col-span-2">{message}</p> : null}
            <div className="flex flex-wrap gap-3 md:col-span-2">
              <Button type="submit" disabled={pending}>
                {draft.id ? "Salvar atividade" : "Adicionar atividade"}
              </Button>
              {draft.id ? (
                <Button type="button" variant="outline" onClick={() => setDraft(emptyDraft(selectedDay))}>
                  Cancelar edição
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Dias">
          {days.map((item) => (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={item === selectedDay ? "default" : "outline"}
              aria-pressed={item === selectedDay}
              onClick={() => setDay(item)}
            >
              {formatDayLabel(item)}
            </Button>
          ))}
        </div>
        <div className="flex gap-2" role="tablist" aria-label="Visualização">
          <Button
            type="button"
            size="sm"
            variant={view === "grade" ? "default" : "outline"}
            aria-pressed={view === "grade"}
            onClick={() => setView("grade")}
          >
            Grade
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === "lista" ? "default" : "outline"}
            aria-pressed={view === "lista"}
            onClick={() => setView("lista")}
          >
            Lista
          </Button>
        </div>
      </div>

      {view === "grade" ? (
        <ScheduleGrid
          event={event}
          day={selectedDay}
          onEdit={edit}
        />
      ) : (
        <ol className="flex flex-col gap-2">
          {event.activities.length === 0 ? <li>Nenhuma atividade ainda.</li> : null}
          {event.activities.map((activity) => (
            <li
              key={activity.id}
              className={`flex flex-wrap items-center gap-3 rounded-xl bg-white px-3 py-3 ring-1 ring-foreground/10 ${dragging === activity.id ? "opacity-60" : ""}`}
              onDragOver={(item) => item.preventDefault()}
              onDrop={(item) => {
                item.preventDefault();
                void dropOn(activity.id);
              }}
            >
              <button
                type="button"
                className="cursor-grab rounded-md p-1 text-brand-purple hover:bg-brand-lilac"
                draggable
                aria-label={`Arrastar ${activity.title}`}
                onDragStart={(item) => {
                  item.dataTransfer.setData("text/plain", activity.id);
                  item.dataTransfer.effectAllowed = "move";
                  setDragging(activity.id);
                }}
                onDragEnd={() => setDragging(null)}
              >
                <GripVertical />
              </button>
              <span className="min-w-0 flex-1">
                <span className="font-medium">{activity.title}</span>
                <span className="block text-sm text-brand-purple">
                  {activityLabel[activity.type]}
                  {" · "}
                  {formatDayLabel(saoPauloDay(activity.startsAt))} {formatClock(activity.startsAt)}–{formatClock(activity.endsAt)}
                  {" · "}
                  {activity.locationId ? locationName.get(activity.locationId) ?? "Local" : "Sem local"}
                  {activity.grantsStamp ? " · carimbo" : ""}
                  {activity.requiresEnrollment ? " · inscrição própria" : ""}
                </span>
              </span>
              <Button type="button" size="sm" variant="outline" onClick={() => edit(activity)}>Editar</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => void duplicate(activity.id)} disabled={pending}>
                Duplicar
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => void remove(activity.id)} disabled={pending}>
                Remover
              </Button>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

function Conflicts({
  event,
  locationName,
}: {
  event: AdminEventDetail;
  locationName: Map<string, string>;
}) {
  if (event.conflicts.length === 0) {
    return <p role="status" className="text-sm text-brand-purple">Nenhuma sobreposição de local.</p>;
  }
  return (
    <div role="alert" className="rounded-xl border border-brand-pink-dark bg-white px-4 py-3 text-sm text-brand-pink-dark">
      {event.conflicts.map((conflict) => (
        <p key={conflict.activityIds.join("-")}>
          {conflict.titles[0]} e {conflict.titles[1]} ocupam {locationName.get(conflict.locationId) ?? "o mesmo local"} no mesmo horário.
        </p>
      ))}
    </div>
  );
}

function ScheduleGrid({
  event,
  day,
  onEdit,
}: {
  event: AdminEventDetail;
  day: string;
  onEdit: (activity: Activity) => void;
}) {
  const placed = event.activities.flatMap((activity) => {
    const range = visibleOnDay(activity, day);
    return range ? [{ activity, ...range }] : [];
  });
  const columns = event.locations.map((item) => ({ id: item.id, name: item.name }));
  if (columns.length === 0 || placed.some((item) => !item.activity.locationId)) {
    columns.push({ id: "", name: "Sem local" });
  }
  let from = 8 * 60;
  let to = 18 * 60;
  for (const item of placed) {
    from = Math.min(from, Math.floor(item.start / 30) * 30);
    to = Math.max(to, Math.ceil(item.end / 30) * 30);
  }
  if (to <= from) to = from + 60;
  const height = ((to - from) / 60) * 72;
  const conflictIds = new Set(event.conflicts.flatMap((item) => item.activityIds));

  return (
    <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-foreground/10" data-view="grade">
      <div
        className="grid min-w-[44rem]"
        style={{ gridTemplateColumns: `4.5rem repeat(${columns.length}, minmax(9rem, 1fr))` }}
      >
        <div />
        {columns.map((column) => (
          <div key={column.id || "none"} className="border-b border-l border-brand-lilac px-2 py-2 text-sm font-medium">
            {column.name}
          </div>
        ))}
        <div className="relative" style={{ height }}>
          {hourMarks(from, to).map((minute) => (
            <span
              key={minute}
              className="absolute right-2 -translate-y-1/2 text-xs text-brand-purple"
              style={{ top: `${((minute - from) / (to - from)) * 100}%` }}
            >
              {clock(minute)}
            </span>
          ))}
        </div>
        {columns.map((column) => {
          const items = placed.filter((item) => (item.activity.locationId ?? "") === column.id);
          const laid = layoutColumn(items);
          return (
            <div key={column.id || "none"} className="relative border-l border-brand-lilac" style={{ height }}>
              {hourMarks(from, to).map((minute) => (
                <div
                  key={minute}
                  className="absolute inset-x-0 border-t border-brand-lilac/70"
                  style={{ top: `${((minute - from) / (to - from)) * 100}%` }}
                />
              ))}
              {laid.map((item) => (
                <button
                  key={item.activity.id}
                  type="button"
                  data-conflict={conflictIds.has(item.activity.id) ? "true" : "false"}
                  className={`absolute overflow-hidden rounded-md px-2 py-1 text-left text-xs ${
                    conflictIds.has(item.activity.id)
                      ? "border-2 border-brand-pink-dark bg-brand-pink/15"
                      : "border border-brand-purple/30 bg-brand-lilac"
                  }`}
                  style={{
                    top: `${((item.start - from) / (to - from)) * 100}%`,
                    height: `${Math.max(((item.end - item.start) / (to - from)) * 100, 6)}%`,
                    left: `calc(${(item.lane / item.lanes) * 100}% + 2px)`,
                    width: `calc(${100 / item.lanes}% - 4px)`,
                  }}
                  onClick={() => onEdit(item.activity)}
                >
                  <span className="block font-medium">{item.activity.title}</span>
                  <span className="block text-brand-purple">
                    {formatClock(item.activity.startsAt)}–{formatClock(item.activity.endsAt)}
                  </span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>
      {children}
      {hint ? <p className="text-sm text-brand-purple">{hint}</p> : null}
      {error ? <p className="text-sm text-brand-pink-dark">{error}</p> : null}
    </div>
  );
}

function emptyDraft(day: string): Draft {
  const date = day || new Date().toISOString().slice(0, 10);
  return {
    id: null,
    title: "",
    description: "",
    type: "STAND",
    locationId: "",
    startsAt: `${date}T09:00`,
    endsAt: `${date}T12:00`,
    responsible: "",
    capacity: "",
    requiresEnrollment: false,
    grantsStamp: false,
  };
}

function moveBefore(ids: string[], sourceId: string, targetId: string): string[] {
  const next = ids.filter((id) => id !== sourceId);
  const index = next.indexOf(targetId);
  if (index < 0) return ids;
  next.splice(index, 0, sourceId);
  return next;
}

function minutesOfDay(iso: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

function visibleOnDay(activity: Activity, day: string): { start: number; end: number } | null {
  const startDay = saoPauloDay(activity.startsAt);
  const endDay = saoPauloDay(activity.endsAt);
  if (startDay > day || endDay < day) return null;
  const start = startDay === day ? minutesOfDay(activity.startsAt) : 0;
  const end = endDay === day ? minutesOfDay(activity.endsAt) : 24 * 60;
  if (end <= start) return null;
  return { start, end };
}

function hourMarks(from: number, to: number): number[] {
  const marks: number[] = [];
  const first = Math.ceil(from / 60) * 60;
  for (let minute = first; minute <= to; minute += 60) marks.push(minute);
  return marks;
}

function clock(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function layoutColumn<T extends { start: number; end: number; activity: Activity }>(items: T[]) {
  const sorted = [...items].sort((left, right) => left.start - right.start || left.end - right.end);
  const laneOf = new Map<string, number>();
  const active: { end: number; lane: number }[] = [];
  for (const item of sorted) {
    const still = active.filter((entry) => entry.end > item.start);
    active.length = 0;
    active.push(...still);
    const used = new Set(active.map((entry) => entry.lane));
    let lane = 0;
    while (used.has(lane)) lane += 1;
    active.push({ end: item.end, lane });
    laneOf.set(item.activity.id, lane);
  }
  return items.map((item) => {
    const overlapping = items.filter((other) => other.end > item.start && item.end > other.start);
    const lanes = Math.max(1, ...overlapping.map((other) => (laneOf.get(other.activity.id) ?? 0) + 1));
    return { ...item, lane: laneOf.get(item.activity.id) ?? 0, lanes };
  });
}
