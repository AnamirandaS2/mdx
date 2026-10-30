import { z } from "zod";

export const eventStatuses = ["DRAFT", "PUBLISHED", "CLOSED"] as const;
export type EventStatus = (typeof eventStatuses)[number];

export const activityTypes = [
  "STAND",
  "TALK",
  "WORKSHOP",
  "COMPETITION",
  "CULTURAL",
  "OTHER",
] as const;
export type ActivityType = (typeof activityTypes)[number];

export const teamRoles = ["ORGANIZER", "STAFF", "MONITOR", "JUDGE"] as const;
export type TeamRole = (typeof teamRoles)[number];

export const BANNER_MAX_BYTES = 2 * 1024 * 1024;
export const bannerMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export type BannerMime = (typeof bannerMimeTypes)[number];

export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const slugSchema = z
  .string()
  .trim()
  .min(3, "O endereço precisa de pelo menos 3 caracteres.")
  .max(80, "O endereço pode ter no máximo 80 caracteres.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use letras minúsculas, números e hífens.",
  );

const text = (max: number) => z.string().trim().max(max, "Texto longo demais.");

const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Use uma cor no formato #RRGGBB.");

const instant = z.string().refine((value) => {
  return !Number.isNaN(Date.parse(value));
}, "Data inválida.");

export const eventCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Informe o título.")
    .max(120, "O título pode ter no máximo 120 caracteres."),
  slug: slugSchema,
  theme: text(80).optional(),
  description: text(5000).optional(),
  place: text(160).optional(),
  address: text(240).optional(),
  startsAt: instant.nullable().optional(),
  endsAt: instant.nullable().optional(),
  colorPrimary: hexColor.nullable().optional(),
  colorSecondary: hexColor.nullable().optional(),
  colorAccent: hexColor.nullable().optional(),
});

export const eventPatchSchema = eventCreateSchema.partial();

export type EventWrite = z.infer<typeof eventCreateSchema>;

export function dateOrderMessage(
  startsAt: string | null | undefined,
  endsAt: string | null | undefined,
): string | null {
  if (!startsAt || !endsAt) return null;
  const start = Date.parse(startsAt);
  const end = Date.parse(endsAt);
  if (Number.isNaN(start) || Number.isNaN(end)) return "Data inválida.";
  if (end <= start) return "O fim precisa ser depois do início.";
  return null;
}

export const locationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome do local.")
    .max(80, "O nome do local pode ter no máximo 80 caracteres."),
  notes: text(500).optional(),
});

export const memberSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Informe um e-mail válido."),
  role: z.enum(teamRoles, "Escolha um papel."),
});

export const memberRoleSchema = z.object({
  role: z.enum(teamRoles, "Escolha um papel."),
});

const uuid = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    "Local inválido.",
  );

export const activitySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Informe o título da atividade.")
      .max(120, "O título pode ter no máximo 120 caracteres."),
    description: text(2000).optional(),
    type: z.enum(activityTypes, "Escolha o tipo da atividade."),
    locationId: uuid.nullable().optional(),
    startsAt: instant,
    endsAt: instant,
    responsible: z
      .string()
      .trim()
      .min(2, "Informe quem responde pela atividade.")
      .max(80, "O nome pode ter no máximo 80 caracteres."),
    capacity: z
      .number()
      .int()
      .min(1, "As vagas precisam ser pelo menos 1.")
      .max(5000, "O limite de vagas é 5000.")
      .nullable()
      .optional(),
    requiresEnrollment: z.boolean().optional(),
    grantsStamp: z.boolean().optional(),
  })
  .refine((value) => Date.parse(value.endsAt) > Date.parse(value.startsAt), {
    message: "O fim precisa ser depois do início.",
    path: ["endsAt"],
  });

export const activityPatchSchema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  description: text(2000).optional(),
  type: z.enum(activityTypes).optional(),
  locationId: uuid.nullable().optional(),
  startsAt: instant.optional(),
  endsAt: instant.optional(),
  responsible: z.string().trim().min(2).max(80).optional(),
  capacity: z.number().int().min(1).max(5000).nullable().optional(),
  requiresEnrollment: z.boolean().optional(),
  grantsStamp: z.boolean().optional(),
});

export const reorderSchema = z.object({
  ids: z.array(uuid).min(1, "Informe a ordem das atividades."),
});

export type ScheduleItem = {
  id: string;
  title: string;
  locationId: string | null;
  startsAt: string;
  endsAt: string;
};

export type ScheduleConflict = {
  locationId: string;
  activityIds: [string, string];
  titles: [string, string];
};

export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return Date.parse(aStart) < Date.parse(bEnd) && Date.parse(bStart) < Date.parse(aEnd);
}

export function findScheduleConflicts(items: ScheduleItem[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  for (let leftIndex = 0; leftIndex < items.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < items.length; rightIndex += 1) {
      const left = items[leftIndex];
      const right = items[rightIndex];
      if (!left || !right || !left.locationId || left.locationId !== right.locationId) continue;
      if (!rangesOverlap(left.startsAt, left.endsAt, right.startsAt, right.endsAt)) continue;
      conflicts.push({
        locationId: left.locationId,
        activityIds: [left.id, right.id],
        titles: [left.title, right.title],
      });
    }
  }
  return conflicts;
}

export const steamStands = [
  { title: "Ciência", description: "Experimentos, observação e perguntas." },
  { title: "Tecnologia", description: "Ferramentas digitais, código e robótica." },
  { title: "Engenharia", description: "Construir, testar e ajustar." },
  { title: "Artes", description: "Cor, forma e invenção." },
  { title: "Matemática", description: "Padrões, jogos e lógica." },
] as const;

const steamWindows = [
  [9, 12],
  [14, 17],
] as const;

export function calendarDays(startsAt: string | null, endsAt: string | null): string[] {
  const start = startsAt ? saoPauloDay(startsAt) : saoPauloDay(new Date().toISOString());
  const end = endsAt ? saoPauloDay(endsAt) : start;
  const first = start <= end ? start : end;
  const last = start <= end ? end : start;
  const days: string[] = [];
  let cursor = first;
  while (cursor <= last && days.length < 14) {
    days.push(cursor);
    cursor = addCalendarDay(cursor);
  }
  return days.length > 0 ? days : [first];
}

export function saoPauloDay(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export const eventTimeZone = "America/Fortaleza";

export function fortalezaDay(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: eventTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function formatFortalezaClock(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: eventTimeZone,
  }).format(new Date(iso));
}

export function formatFortalezaDay(day: string): string {
  const label = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: eventTimeZone,
  }).format(new Date(`${day}T12:00:00-03:00`));
  return label.charAt(0).toLocaleUpperCase("pt-BR") + label.slice(1);
}

function addCalendarDay(day: string): string {
  const next = new Date(`${day}T12:00:00-03:00`);
  next.setTime(next.getTime() + 24 * 60 * 60 * 1000);
  return saoPauloDay(next.toISOString());
}

function atLocal(day: string, hour: number): string {
  return new Date(`${day}T${String(hour).padStart(2, "0")}:00:00-03:00`).toISOString();
}

export type SteamPlacement = {
  title: string;
  description: string;
  locationId: string | null;
  startsAt: string;
  endsAt: string;
};

export function planSteamStands(input: {
  startsAt: string | null;
  endsAt: string | null;
  locationIds: string[];
  existing: ScheduleItem[];
}): SteamPlacement[] {
  const taken = new Set(input.existing.map((item) => item.title));
  const pending = steamStands.filter((stand) => !taken.has(stand.title));
  const locations = input.locationIds.length > 0 ? input.locationIds : [null];
  const occupied: ScheduleItem[] = input.existing.map((item) => ({ ...item }));
  const days = calendarDays(input.startsAt, input.endsAt);
  return pending.map((stand) => {
    const slot = firstFreeSlot(days, locations, occupied);
    const placed: ScheduleItem = {
      id: `steam-${stand.title}`,
      title: stand.title,
      locationId: slot?.locationId ?? locations[0] ?? null,
      startsAt: slot?.startsAt ?? atLocal(days[0] ?? saoPauloDay(new Date().toISOString()), 9),
      endsAt: slot?.endsAt ?? atLocal(days[0] ?? saoPauloDay(new Date().toISOString()), 12),
    };
    occupied.push(placed);
    return {
      title: stand.title,
      description: stand.description,
      locationId: placed.locationId,
      startsAt: placed.startsAt,
      endsAt: placed.endsAt,
    };
  });
}

function firstFreeSlot(
  baseDays: string[],
  locations: Array<string | null>,
  occupied: ScheduleItem[],
): { locationId: string | null; startsAt: string; endsAt: string } | null {
  const days = [...baseDays];
  const rounds = days.length + 3;
  for (let round = 0; round < rounds; round += 1) {
    if (round >= days.length) {
      const last = days[days.length - 1];
      if (!last) break;
      days.push(addCalendarDay(last));
    }
    const day = days[round];
    if (!day) continue;
    for (const [startHour, endHour] of steamWindows) {
      const startsAt = atLocal(day, startHour);
      const endsAt = atLocal(day, endHour);
      for (const locationId of locations) {
        const busy = occupied.some(
          (item) =>
            (item.locationId ?? null) === locationId &&
            rangesOverlap(item.startsAt, item.endsAt, startsAt, endsAt),
        );
        if (!busy) return { locationId, startsAt, endsAt };
      }
    }
  }
  return null;
}

export const bannerFileSchema = z.object({
  mimetype: z.enum(bannerMimeTypes, "Use uma imagem JPEG, PNG ou WebP."),
  size: z
    .number()
    .int()
    .positive()
    .max(BANNER_MAX_BYTES, "A imagem pode ter no máximo 2 MB."),
});

export function detectBannerMime(bytes: Uint8Array): BannerMime | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(bytes[0] ?? 0, bytes[1] ?? 0, bytes[2] ?? 0, bytes[3] ?? 0) ===
      "RIFF" &&
    String.fromCharCode(bytes[8] ?? 0, bytes[9] ?? 0, bytes[10] ?? 0, bytes[11] ?? 0) ===
      "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function bannerError(file: {
  mimetype: string;
  size: number;
  bytes?: Uint8Array;
}): string | null {
  const parsed = bannerFileSchema.safeParse({
    mimetype: file.mimetype,
    size: file.size,
  });
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Imagem inválida.";
  }
  if (file.bytes && detectBannerMime(file.bytes) !== file.mimetype) {
    return "O arquivo não é a imagem que ele declara.";
  }
  return null;
}

export type PublishSnapshot = {
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  place: string;
  activityCount: number;
};

export function publishBlockers(event: PublishSnapshot): string[] {
  const blockers: string[] = [];
  if (event.title.trim().length < 2) blockers.push("Informe o título.");
  if (!event.startsAt || !event.endsAt) {
    blockers.push("Informe o início e o fim.");
  } else if (Date.parse(event.endsAt) <= Date.parse(event.startsAt)) {
    blockers.push("O fim precisa ser depois do início.");
  }
  if (event.place.trim().length < 2) blockers.push("Informe o local.");
  if (event.activityCount < 1) {
    blockers.push("Cadastre pelo menos uma atividade.");
  }
  return blockers;
}

export function zodFields(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] ? String(issue.path[0]) : "form";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}
