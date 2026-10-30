"use client";

import { useMemo, useState } from "react";
import { activityLabel } from "@/components/admin/event-format";
import {
  formatFortalezaClock,
  formatFortalezaDay,
  fortalezaDay,
  type ActivityType,
} from "@/server/event-schema";

export type PublicActivity = {
  id: string;
  title: string;
  description: string;
  type: ActivityType;
  startsAt: string;
  endsAt: string;
  locationName: string | null;
  responsible: string;
  grantsStamp: boolean;
  requiresEnrollment: boolean;
};

const typeOrder: ActivityType[] = [
  "STAND",
  "TALK",
  "WORKSHOP",
  "COMPETITION",
  "CULTURAL",
  "OTHER",
];

export function Schedule({ activities }: { activities: PublicActivity[] }) {
  const [filter, setFilter] = useState<ActivityType | "ALL">("ALL");
  const types = useMemo(
    () => typeOrder.filter((type) => activities.some((item) => item.type === type)),
    [activities],
  );
  const days = groupDays(activities);
  const [day, setDay] = useState(days[0]?.[0] ?? "");
  const selectedKey = days.some(([key]) => key === day) ? day : days[0]?.[0] ?? "";
  const selected = (days.find(([key]) => key === selectedKey)?.[1] ?? []).filter(
    (item) => filter === "ALL" || item.type === filter,
  );

  if (activities.length === 0) {
    return <p>A programação ainda não foi publicada.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div role="group" aria-label="Escolher o dia" className="flex flex-wrap gap-2">
        {days.map(([key]) => (
          <FilterButton key={key} pressed={selectedKey === key} onClick={() => setDay(key)}>
            {formatFortalezaDay(key)}
          </FilterButton>
        ))}
      </div>
      <div role="group" aria-label="Filtrar por tipo de atividade" className="flex flex-wrap gap-2">
        <FilterButton pressed={filter === "ALL"} onClick={() => setFilter("ALL")}>
          Todas
        </FilterButton>
        {types.map((type) => (
          <FilterButton key={type} pressed={filter === type} onClick={() => setFilter(type)}>
            {activityLabel[type]}
          </FilterButton>
        ))}
      </div>
      <p aria-live="polite" className="text-sm font-semibold text-[#4C1D95]">
        {selected.length === 1 ? "1 atividade neste dia" : `${selected.length} atividades neste dia`}
        {filter === "ALL" ? "" : ` de ${activityLabel[filter]}`}
      </p>
      {selected.length === 0 ? (
        <p>Nada nesse filtro neste dia.</p>
      ) : (
        <ol className="relative ml-4 border-l-4 border-[#E9D5FF]">
          {selected.map((item) => (
            <li key={item.id} className="relative pb-6 pl-6">
              <span className="absolute top-1 -left-[0.7rem] size-4 rounded-full border-4 border-white bg-[#FF4A97]" aria-hidden="true" />
              <p className="font-heading text-sm font-bold text-[#7C3AED]">
                <time dateTime={item.startsAt}>{formatFortalezaClock(item.startsAt)}</time>
                {" – "}
                <time dateTime={item.endsAt}>{formatFortalezaClock(item.endsAt)}</time>
              </p>
              <h4 className="font-heading text-lg text-[#330043]">{item.title}</h4>
              <p className="text-sm text-[#4C1D95]">
                {activityLabel[item.type]}
                {item.locationName ? ` · ${item.locationName}` : ""}
                {item.grantsStamp ? " · carimbo" : ""}
                {item.requiresEnrollment ? " · inscrição própria" : ""}
              </p>
              {item.description || item.responsible ? (
                <details className="mt-1">
                  <summary className="cursor-pointer text-sm font-semibold text-[#330043]">Detalhes</summary>
                  {item.description ? <p className="mt-1 whitespace-pre-wrap text-sm">{item.description}</p> : null}
                  {item.responsible ? <p className="mt-1 text-sm">Responsável: {item.responsible}.</p> : null}
                </details>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function FilterButton({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={
        pressed
          ? "inline-flex min-h-11 items-center rounded-full border-2 border-[#330043] bg-[#FFCD34] px-4 text-sm font-bold text-[#330043] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#330043]"
          : "inline-flex min-h-11 items-center rounded-full border-2 border-[#330043] bg-white px-4 text-sm font-bold text-[#330043] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#330043]"
      }
    >
      {children}
    </button>
  );
}

function groupDays(activities: PublicActivity[]): [string, PublicActivity[]][] {
  const groups = new Map<string, PublicActivity[]>();
  const sorted = [...activities].sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.title.localeCompare(b.title, "pt-BR"));
  for (const item of sorted) {
    const day = fortalezaDay(item.startsAt);
    const list = groups.get(day);
    if (list) list.push(item);
    else groups.set(day, [item]);
  }
  return [...groups.entries()];
}
