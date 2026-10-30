"use client";

import { GripVertical, Lock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/brand/page-header";
import { categoryLabel, RegistrationForm } from "@/components/registration-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  fieldTypes,
  fixedFields,
  formFieldSchema,
  formIssues,
  registrationCategories,
  type FieldType,
  type FormFieldConfig,
  type RegistrationCategory,
} from "@/server/form-schema";
import {
  atualizarCampo,
  criarCampo,
  criarPerguntasCompeticao,
  obterEvento,
  removerCampo,
  reordenarCampos,
  type AdminEventDetail,
} from "@/server/events";

const selectClass =
  "h-11 w-full rounded-lg border border-input bg-white px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";

const typeLabel: Record<FieldType, string> = {
  TEXT: "Texto curto",
  LONGTEXT: "Texto longo",
  SELECT: "Seleção",
  CHECKBOX: "Caixas de marcação",
  NUMBER: "Número",
};

type Draft = {
  id: string | null;
  label: string;
  help: string;
  type: FieldType;
  required: boolean;
  options: string;
  categories: RegistrationCategory[];
};

export function FormBuilderRoute() {
  const params = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<AdminEventDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void obterEvento(params.eventId).then((result) => {
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
  }, [params.eventId]);

  if (error) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <p role="alert" className="text-brand-pink-dark">{error}</p>
      </main>
    );
  }
  if (!event) return <main className="px-4 py-10">Carregando o formulário…</main>;
  return <FormBuilder event={event} onChange={setEvent} />;
}

function FormBuilder({
  event,
  onChange,
}: {
  event: AdminEventDetail;
  onChange: (event: AdminEventDetail) => void;
}) {
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const preview = previewFields(event.formFields, draft);

  async function save(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const input = {
      label: draft.label,
      help: draft.help,
      type: draft.type,
      required: draft.required,
      options: splitOptions(draft.options),
      categories: draft.categories,
    };
    const parsed = formFieldSchema.safeParse(input);
    if (!parsed.success) {
      setErrors(formIssues(parsed.error));
      return;
    }
    setPending(true);
    try {
      const result = draft.id
        ? await atualizarCampo(event.id, draft.id, parsed.data)
        : await criarCampo(event.id, parsed.data);
      if (!result.ok) {
        setErrors(result.fields ?? {});
        setMessage(result.message);
        return;
      }
      onChange(result.data);
      setDraft(emptyDraft());
      setErrors({});
      setMessage(draft.id ? "Campo atualizado." : "Campo adicionado.");
    } catch {
      setMessage("Não foi possível salvar o campo.");
    } finally {
      setPending(false);
    }
  }

  async function remove(fieldId: string) {
    setPending(true);
    try {
      const result = await removerCampo(event.id, fieldId);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      if (draft.id === fieldId) setDraft(emptyDraft());
      onChange(result.data);
      setMessage("Campo removido.");
    } catch {
      setMessage("Não foi possível remover o campo.");
    } finally {
      setPending(false);
    }
  }

  async function competitor() {
    setPending(true);
    try {
      const result = await criarPerguntasCompeticao(event.id);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      onChange(result.data);
      setMessage("Perguntas de competição adicionadas. Elas só aparecem para Competidora.");
    } catch {
      setMessage("Não foi possível adicionar as perguntas.");
    } finally {
      setPending(false);
    }
  }

  async function dropOn(targetId: string) {
    const sourceId = dragging;
    setDragging(null);
    if (!sourceId || sourceId === targetId) return;
    const ids = moveBefore(event.formFields.map((item) => item.id), sourceId, targetId);
    const result = await reordenarCampos(event.id, ids);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    onChange(result.data);
  }

  function edit(field: FormFieldConfig) {
    setDraft({
      id: field.id,
      label: field.label,
      help: field.help,
      type: field.type,
      required: field.required,
      options: field.options.join("\n"),
      categories: field.categories,
    });
    setErrors({});
    document.getElementById("campo-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Formulário de inscrição"
          description={`${event.title}. Os campos fixos ficam em toda inscrição. Os outros seguem a ordem e a categoria que você definir.`}
        />
        <div className="flex flex-wrap gap-3">
          <Button nativeButton={false} variant="outline" render={<Link href={`/e/${event.slug}#inscricao`} />}>
            Abrir o formulário público
          </Button>
          <Button type="button" variant="secondary" onClick={() => void competitor()} disabled={pending}>
            Perguntas para competidoras
          </Button>
        </div>
        <section className="flex flex-col gap-2">
          <h2 className="font-heading text-xl text-brand-ink">Campos fixos</h2>
          <ul className="flex flex-col gap-2">
            {fixedFields.map((field) => (
              <li key={field.key} className="flex items-center gap-3 rounded-xl bg-white px-3 py-3 ring-1 ring-foreground/10">
                <Lock className="text-brand-purple" aria-hidden="true" />
                <span>
                  <span className="font-medium">{field.label}</span>
                  <span className="block text-sm text-brand-purple">Obrigatório · não sai do formulário</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="font-heading text-xl text-brand-ink">Campos da organização</h2>
          <ul className="flex flex-col gap-2">
            {event.formFields.length === 0 ? <li>Nenhum campo extra ainda.</li> : null}
            {event.formFields.map((field) => (
              <li
                key={field.id}
                className={`flex flex-wrap items-center gap-3 rounded-xl bg-white px-3 py-3 ring-1 ring-foreground/10 ${dragging === field.id ? "opacity-60" : ""}`}
                onDragOver={(item) => item.preventDefault()}
                onDrop={(item) => {
                  item.preventDefault();
                  void dropOn(field.id);
                }}
              >
                <button
                  type="button"
                  className="cursor-grab rounded-md p-1 text-brand-purple hover:bg-brand-lilac"
                  draggable
                  aria-label={`Arrastar ${field.label}`}
                  onDragStart={(item) => {
                    item.dataTransfer.setData("text/plain", field.id);
                    item.dataTransfer.effectAllowed = "move";
                    setDragging(field.id);
                  }}
                  onDragEnd={() => setDragging(null)}
                >
                  <GripVertical />
                </button>
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{field.label}</span>
                  <span className="block text-sm text-brand-purple">
                    {typeLabel[field.type]}
                    {field.required ? " · obrigatório" : ""}
                    {field.categories.length > 0
                      ? ` · ${field.categories.map((item) => categoryLabel[item]).join(", ")}`
                      : " · todas as categorias"}
                  </span>
                </span>
                <Button type="button" size="sm" variant="outline" onClick={() => edit(field)}>Editar</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => void remove(field.id)} disabled={pending}>
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        </section>
        <Card>
          <CardContent className="flex flex-col gap-4" id="campo-form">
            <h2 className="font-heading text-xl text-brand-ink">
              {draft.id ? `Editar ${draft.label || "campo"}` : "Novo campo"}
            </h2>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={(formEvent) => void save(formEvent)}>
              <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="field-label">
                Rótulo
                <Input id="field-label" value={draft.label} onChange={(item) => setDraft({ ...draft, label: item.target.value })} required />
                {errors.label ? <span className="font-normal text-brand-pink-dark">{errors.label}</span> : null}
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="field-type">
                Tipo
                <select
                  id="field-type"
                  className={selectClass}
                  value={draft.type}
                  onChange={(item) => setDraft({ ...draft, type: item.target.value as FieldType })}
                >
                  {fieldTypes.map((item) => (
                    <option key={item} value={item}>{typeLabel[item]}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium md:col-span-2" htmlFor="field-help">
                Ajuda
                <Input id="field-help" value={draft.help} onChange={(item) => setDraft({ ...draft, help: item.target.value })} />
                {errors.help ? <span className="font-normal text-brand-pink-dark">{errors.help}</span> : null}
              </label>
              {draft.type === "SELECT" || draft.type === "CHECKBOX" ? (
                <label className="flex flex-col gap-2 text-sm font-medium md:col-span-2" htmlFor="field-options">
                  Opções
                  <Textarea
                    id="field-options"
                    value={draft.options}
                    onChange={(item) => setDraft({ ...draft, options: item.target.value })}
                    placeholder={"Uma opção por linha"}
                  />
                  <span className="font-normal text-brand-purple">
                    {draft.type === "CHECKBOX"
                      ? "Com opções, a pessoa marca uma ou mais. Sem opções, vira uma caixa só."
                      : "A pessoa escolhe uma."}
                  </span>
                  {errors.options ? <span className="font-normal text-brand-pink-dark">{errors.options}</span> : null}
                </label>
              ) : null}
              <label className="flex items-center gap-2 text-sm" htmlFor="field-required">
                <input
                  id="field-required"
                  type="checkbox"
                  className="size-4 accent-[#EC4899]"
                  checked={draft.required}
                  onChange={(item) => setDraft({ ...draft, required: item.target.checked })}
                />
                Obrigatório
              </label>
              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-medium">Mostrar para</legend>
                <span className="text-sm text-brand-purple">Sem marcação, o campo aparece para todo mundo.</span>
                {registrationCategories.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 accent-[#EC4899]"
                      checked={draft.categories.includes(item)}
                      onChange={(change) => {
                        const categories = change.target.checked
                          ? [...draft.categories, item]
                          : draft.categories.filter((current) => current !== item);
                        setDraft({ ...draft, categories });
                      }}
                    />
                    {categoryLabel[item]}
                  </label>
                ))}
              </fieldset>
              {message ? <p role="status" className="text-sm text-brand-purple md:col-span-2">{message}</p> : null}
              <div className="flex flex-wrap gap-3 md:col-span-2">
                <Button type="submit" disabled={pending}>{draft.id ? "Salvar campo" : "Adicionar campo"}</Button>
                {draft.id ? (
                  <Button type="button" variant="outline" onClick={() => setDraft(emptyDraft())}>Cancelar edição</Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <h2 className="font-heading text-xl text-brand-ink">Pré-visualização</h2>
            <RegistrationForm fields={preview} preview />
          </CardContent>
        </Card>
      </aside>
    </main>
  );
}

function emptyDraft(): Draft {
  return {
    id: null,
    label: "",
    help: "",
    type: "TEXT",
    required: false,
    options: "",
    categories: [],
  };
}

function splitOptions(value: string): string[] {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function previewFields(fields: FormFieldConfig[], draft: Draft): FormFieldConfig[] {
  const overlay = draft.label.trim().length >= 2 ? toConfig(draft) : null;
  const next = fields.map((field) => (overlay && draft.id === field.id ? overlay : field));
  if (overlay && !draft.id) next.push(overlay);
  return next;
}

function toConfig(draft: Draft): FormFieldConfig {
  return {
    id: draft.id ?? "rascunho",
    label: draft.label.trim(),
    help: draft.help.trim(),
    type: draft.type,
    required: draft.required,
    options: splitOptions(draft.options),
    categories: draft.categories,
    displayOrder: draft.id ? 0 : 999,
  };
}

function moveBefore(ids: string[], sourceId: string, targetId: string): string[] {
  const next = ids.filter((id) => id !== sourceId);
  const index = next.indexOf(targetId);
  if (index < 0) return ids;
  next.splice(index, 0, sourceId);
  return next;
}
