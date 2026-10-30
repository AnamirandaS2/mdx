"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { categoryLabel } from "@/components/registration-form";
import {
  answerError,
  fieldApplies,
  fixedFields,
  formIssues,
  registrationCategories,
  registrationSchema,
  type FormFieldConfig,
  type RegistrationCategory,
} from "@/server/form-schema";
import { inscrever } from "@/server/events";

const selectClass =
  "h-12 w-full rounded-2xl border-2 border-[#330043] bg-white px-3 text-base text-[#330043] outline-none focus-visible:ring-3 focus-visible:ring-[#7C3AED]";

export function SteppedRegistration({
  fields,
  slug,
  preview = false,
  closed = false,
  defaultName = "",
  defaultEmail = "",
}: {
  fields: FormFieldConfig[];
  slug?: string;
  preview?: boolean;
  closed?: boolean;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState("");
  const [institution, setInstitution] = useState("");
  const [category, setCategory] = useState<RegistrationCategory>("VISITOR");
  const [answers, setAnswers] = useState<Record<string, string | boolean | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [passport, setPassport] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const visible = useMemo(
    () => fields.filter((field) => fieldApplies(field, category)),
    [fields, category],
  );
  const stages: Array<"voce" | "categoria" | "perguntas" | "confirmar"> = visible.length > 0
    ? ["voce", "categoria", "perguntas", "confirmar"]
    : ["voce", "categoria", "confirmar"];
  const current = stages[Math.min(step, stages.length - 1)] ?? "voce";

  function payload() {
    return {
      name,
      email,
      phone,
      institution,
      category,
      answers: Object.fromEntries(
        visible.map((field) => {
          const value = answers[field.id];
          if (field.type === "NUMBER") return [field.id, value === "" || value === undefined ? "" : Number(value)];
          if (field.type === "CHECKBOX" && field.options.length > 0) return [field.id, value ?? []];
          if (field.type === "CHECKBOX") return [field.id, value === true];
          return [field.id, value ?? ""];
        }),
      ),
    };
  }

  function issues() {
    const parsed = registrationSchema(fields).safeParse(payload());
    return parsed.success ? {} : formIssues(parsed.error);
  }

  function next() {
    const found = issues();
    const keys =
      current === "voce"
        ? ["name", "email", "phone", "institution"]
        : current === "perguntas"
          ? visible.map((field) => `answers.${field.id}`)
          : [];
    const stepErrors = Object.fromEntries(Object.entries(found).filter(([key]) => keys.includes(key)));
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((value) => Math.min(value + 1, stages.length - 1));
  }

  async function submit() {
    const found = issues();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      if (found.name || found.email || found.phone || found.institution) setStep(0);
      else if (Object.keys(found).some((key) => key.startsWith("answers."))) {
        const perguntas = stages.indexOf("perguntas");
        if (perguntas >= 0) setStep(perguntas);
      }
      return;
    }
    setErrors({});
    if (preview || !slug) {
      setMessage("Pré-visualização válida. Nada foi enviado.");
      return;
    }
    if (closed) {
      setMessage("As inscrições deste evento estão encerradas.");
      return;
    }
    setPending(true);
    const result = await inscrever(slug, payload());
    setPending(false);
    if (!result.ok) {
      setErrors(result.fields ?? {});
      setMessage(result.message);
      return;
    }
    setPassport(result.data.passportCode);
    setMessage(null);
  }

  if (passport) {
    return (
      <div role="status" className="rounded-3xl border-4 border-[#330043] bg-[#FFCD34] p-6 text-[#330043] shadow-[6px_6px_0_#330043]">
        <p className="font-heading text-3xl">Inscrição confirmada</p>
        <p className="mt-3 text-lg">
          Seu código é <strong className="font-heading text-2xl">{passport}</strong>. Guarda ele para o credenciamento.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="font-heading text-sm font-bold tracking-widest text-[#BE185D] uppercase">
        Passo {stages.indexOf(current) + 1} de {stages.length}
      </p>
      <ol className="flex gap-2" aria-hidden="true">
        {stages.map((stage, index) => (
          <li
            key={stage}
            className={index <= stages.indexOf(current) ? "h-2 flex-1 rounded-full bg-[#FF4A97]" : "h-2 flex-1 rounded-full bg-[#330043]/15"}
          />
        ))}
      </ol>

      {current === "voce" ? (
        <fieldset className="flex flex-col gap-4">
          <legend className="font-heading text-3xl">Sobre você</legend>
          <Field label={fixedFields[0].label} htmlFor="reg-name" hint={fixedFields[0].help} error={errors.name} required>
            <Input id="reg-name" value={name} onChange={(item) => setName(item.target.value)} autoComplete="name" />
          </Field>
          <Field label={fixedFields[1].label} htmlFor="reg-email" hint={fixedFields[1].help} error={errors.email} required>
            <Input id="reg-email" type="email" value={email} onChange={(item) => setEmail(item.target.value)} autoComplete="email" />
          </Field>
          <Field label={fixedFields[2].label} htmlFor="reg-phone" hint={fixedFields[2].help} error={errors.phone} required>
            <Input id="reg-phone" value={phone} onChange={(item) => setPhone(item.target.value)} autoComplete="tel" />
          </Field>
          <Field label={fixedFields[3].label} htmlFor="reg-institution" hint={fixedFields[3].help} error={errors.institution} required>
            <Input id="reg-institution" value={institution} onChange={(item) => setInstitution(item.target.value)} />
          </Field>
        </fieldset>
      ) : null}

      {current === "categoria" ? (
        <fieldset className="flex flex-col gap-4">
          <legend className="font-heading text-3xl">Como você participa</legend>
          <p className="text-sm text-[#4C1D95]">{fixedFields[4].help}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {registrationCategories.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                className={
                  category === item
                    ? "min-h-16 rounded-3xl border-4 border-[#330043] bg-[#FFCD34] px-4 py-3 text-left font-heading text-xl text-[#330043] shadow-[4px_4px_0_#330043]"
                    : "min-h-16 rounded-3xl border-4 border-[#330043] bg-white px-4 py-3 text-left font-heading text-xl text-[#330043]"
                }
              >
                {categoryLabel[item]}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {current === "perguntas" ? (
        <fieldset className="flex flex-col gap-4">
          <legend className="font-heading text-3xl">Mais um pouco</legend>
          {visible.map((field) => (
            <CustomField
              key={field.id}
              field={field}
              value={answers[field.id]}
              error={errors[`answers.${field.id}`]}
              onChange={(value) => setAnswers((currentAnswers) => ({ ...currentAnswers, [field.id]: value }))}
            />
          ))}
        </fieldset>
      ) : null}

      {current === "confirmar" ? (
        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-3xl">Confere e envia</h2>
          <dl className="grid gap-3 rounded-3xl border-4 border-[#330043] bg-[#FFF6FB] p-4">
            <Review label="Nome" value={name} />
            <Review label="E-mail" value={email} />
            <Review label="Telefone" value={phone} />
            <Review label="Instituição" value={institution} />
            <Review label="Categoria" value={categoryLabel[category]} />
            {visible.map((field) => (
              <Review key={field.id} label={field.label} value={showAnswer(field, answers[field.id])} />
            ))}
          </dl>
          {closed && !preview ? <p className="font-semibold">Inscrições encerradas.</p> : null}
        </div>
      ) : null}

      {message ? <p role="alert" className="text-sm font-semibold text-[#BE185D]">{message}</p> : null}
      {message === "Entre na sua conta para se inscrever." && slug ? (
        <Link href={`/entrar?callbackUrl=/e/${slug}/inscricao`} className="font-bold text-[#BE185D] underline">
          Entrar
        </Link>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {stages.indexOf(current) > 0 ? (
          <button
            type="button"
            onClick={() => {
              setErrors({});
              setStep((value) => Math.max(0, value - 1));
            }}
            className="inline-flex h-12 items-center rounded-full border-4 border-[#330043] bg-white px-5 font-bold text-[#330043]"
          >
            Voltar
          </button>
        ) : null}
        {current === "confirmar" ? (
          <button
            type="button"
            onClick={() => void submit()}
            disabled={pending || (closed && !preview)}
            className="inline-flex h-14 items-center rounded-full border-4 border-[#330043] bg-[#FFCD34] px-6 font-heading text-xl font-bold text-[#330043] shadow-[4px_4px_0_#330043] disabled:opacity-50"
          >
            {pending ? "Enviando…" : preview ? "Testar validação" : "Enviar inscrição"}
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="inline-flex h-14 items-center rounded-full border-4 border-[#330043] bg-[#FF4A97] px-6 font-heading text-xl font-bold text-[#330043] shadow-[4px_4px_0_#330043]"
          >
            Continuar
          </button>
        )}
      </div>
    </div>
  );
}

function showAnswer(field: FormFieldConfig, value: string | boolean | string[] | undefined): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (value === undefined || value === "") return "—";
  const message = answerError(field, value);
  if (message && field.type === "NUMBER") return String(value);
  return String(value);
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-bold text-[#4C1D95]">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function CustomField({
  field,
  value,
  error,
  onChange,
}: {
  field: FormFieldConfig;
  value: string | boolean | string[] | undefined;
  error?: string;
  onChange: (value: string | boolean | string[]) => void;
}) {
  const id = `field-${field.id}`;
  if (field.type === "LONGTEXT") {
    return (
      <Field label={field.label} htmlFor={id} hint={field.help} error={error} required={field.required}>
        <Textarea id={id} value={typeof value === "string" ? value : ""} onChange={(item) => onChange(item.target.value)} />
      </Field>
    );
  }
  if (field.type === "SELECT") {
    return (
      <Field label={field.label} htmlFor={id} hint={field.help} error={error} required={field.required}>
        <select id={id} className={selectClass} value={typeof value === "string" ? value : ""} onChange={(item) => onChange(item.target.value)}>
          <option value="">Escolha</option>
          {field.options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </Field>
    );
  }
  if (field.type === "CHECKBOX" && field.options.length === 0) {
    return (
      <div className="flex flex-col gap-1">
        <label className="flex min-h-11 items-center gap-2 font-semibold" htmlFor={id}>
          <input id={id} type="checkbox" className="size-5 accent-[#BE185D]" checked={value === true} onChange={(item) => onChange(item.target.checked)} />
          {field.label}{field.required ? " *" : ""}
        </label>
        {field.help ? <p className="text-sm text-[#4C1D95]">{field.help}</p> : null}
        {error ? <p className="text-sm font-semibold text-[#BE185D]">{error}</p> : null}
      </div>
    );
  }
  if (field.type === "CHECKBOX") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <fieldset className="flex flex-col gap-2">
        <legend className="font-semibold">{field.label}{field.required ? " *" : ""}</legend>
        {field.help ? <p className="text-sm text-[#4C1D95]">{field.help}</p> : null}
        {field.options.map((option) => (
          <label key={option} className="flex min-h-11 items-center gap-2">
            <input
              type="checkbox"
              className="size-5 accent-[#BE185D]"
              checked={selected.includes(option)}
              onChange={(item) => {
                const next = item.target.checked
                  ? [...selected, option]
                  : selected.filter((current) => current !== option);
                onChange(next);
              }}
            />
            {option}
          </label>
        ))}
        {error ? <p className="text-sm font-semibold text-[#BE185D]">{error}</p> : null}
      </fieldset>
    );
  }
  return (
    <Field label={field.label} htmlFor={id} hint={field.help} error={error} required={field.required}>
      <Input
        id={id}
        type={field.type === "NUMBER" ? "number" : "text"}
        value={typeof value === "string" ? value : ""}
        onChange={(item) => onChange(item.target.value)}
      />
    </Field>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="font-semibold">
        {label}{required ? " *" : ""}
      </label>
      {children}
      {hint ? <p className="text-sm text-[#4C1D95]">{hint}</p> : null}
      {error ? <p className="text-sm font-semibold text-[#BE185D]">{error}</p> : null}
    </div>
  );
}
