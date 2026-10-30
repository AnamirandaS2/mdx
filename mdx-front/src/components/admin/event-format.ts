import { getApiUrl } from "@/lib/api";
import type { ActivityType, EventStatus, TeamRole } from "@/server/event-schema";

const zone = "America/Sao_Paulo";

export const statusLabel: Record<EventStatus, string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
  CLOSED: "Encerrado",
};

export const roleLabel: Record<TeamRole, string> = {
  ORGANIZER: "Organização",
  STAFF: "Credenciamento",
  MONITOR: "Monitoria",
  JUDGE: "Júri",
};

export const activityLabel: Record<ActivityType, string> = {
  STAND: "Stand",
  TALK: "Palestra",
  WORKSHOP: "Oficina",
  COMPETITION: "Competição",
  CULTURAL: "Cultural",
  OTHER: "Outra",
};

export function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")}T${pick("hour")}:${pick("minute")}`;
}

export function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const date = new Date(`${value}:00-03:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function formatClock(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: zone,
  }).format(new Date(iso));
}

export function formatDayLabel(day: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: zone,
  }).format(new Date(`${day}T12:00:00-03:00`));
}

export function formatWhen(startsAt: string | null, endsAt: string | null): string {
  if (!startsAt || !endsAt) return "Datas a definir";
  const format = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: zone,
  });
  return `${format.format(new Date(startsAt))} – ${format.format(new Date(endsAt))}`;
}

export function bannerSrc(banner: string | null): string | null {
  if (!banner) return null;
  if (banner.startsWith("http")) return banner;
  return `${getApiUrl()}${banner}`;
}
