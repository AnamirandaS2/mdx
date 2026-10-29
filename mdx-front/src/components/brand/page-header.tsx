import { Bandeirola, type BandeirolaCor } from "@/components/brand/bandeirola";

const ciclo: BandeirolaCor[] = [
  "rosa",
  "roxo-vivo",
  "roxo",
  "rosa-escuro",
  "lilas",
];

type PageHeaderProps = {
  title: string;
  description?: string;
  level?: 1 | 2;
};

export function PageHeader({
  title,
  description,
  level = 1,
}: PageHeaderProps) {
  const letras =
    level === 1
      ? [...title.replace(/\s+/g, "")].slice(0, 18)
      : [title.trim().charAt(0), "", ""];

  const Heading = level === 1 ? "h1" : "h2";

  return (
    <header className="flex flex-col gap-4">
      <div className="relative flex flex-wrap items-start gap-1.5 pt-1">
        <span
          className="absolute inset-x-0 top-0 h-0.5 rounded-full bg-brand-purple/35"
          aria-hidden="true"
        />
        <div className="flex flex-wrap items-start gap-1.5" aria-hidden="true">
          {letras.map((letra, index) => (
            <Bandeirola
              key={`${letra}-${index}`}
              letra={letra ? letra.toLocaleUpperCase("pt-BR") : undefined}
              cor={ciclo[index % ciclo.length]}
            />
          ))}
        </div>
      </div>
      <div className="flex max-w-3xl flex-col gap-2">
        <Heading
          className={
            level === 1
              ? "text-4xl font-semibold tracking-tight text-brand-ink"
              : "text-2xl font-semibold tracking-tight text-brand-ink"
          }
        >
          {title}
        </Heading>
        {description ? (
          <p className="text-base leading-7 text-brand-purple">{description}</p>
        ) : null}
      </div>
    </header>
  );
}
