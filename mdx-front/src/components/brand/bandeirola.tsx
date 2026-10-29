import { cn } from "cn";

export const bandeirolaCores = {
  rosa: "bg-brand-pink text-white",
  "rosa-escuro": "bg-brand-pink-dark text-white",
  roxo: "bg-brand-purple text-white",
  "roxo-vivo": "bg-brand-purple-bright text-white",
  lilas: "bg-brand-lilac text-brand-ink",
  branco: "bg-white text-brand-purple",
} as const;

export type BandeirolaCor = keyof typeof bandeirolaCores;

type BandeirolaProps = {
  letra?: string;
  texto?: string;
  cor?: BandeirolaCor;
  tamanho?: "sm" | "md";
  className?: string;
};

export function Bandeirola({
  letra,
  texto,
  cor = "rosa",
  tamanho = "md",
  className,
}: BandeirolaProps) {
  const conteudo = texto ?? letra;

  return (
    <span
      className={cn("inline-flex flex-col items-center", className)}
      aria-hidden="true"
    >
      <span
        className={cn(
          "w-px bg-brand-purple/50",
          tamanho === "sm" ? "h-1.5" : "h-2",
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          "inline-flex items-start justify-center text-center font-heading leading-none font-semibold shadow-sm [clip-path:polygon(0_0,100%_0,100%_68%,50%_100%,0_68%)]",
          tamanho === "sm"
            ? "h-8 w-6 px-0.5 pt-1 text-[11px]"
            : "h-12 w-9 px-1 pt-1.5 text-sm",
          texto && texto.length > 1 && "w-auto min-w-9 px-2",
          bandeirolaCores[cor],
        )}
      >
        {conteudo}
      </span>
    </span>
  );
}
