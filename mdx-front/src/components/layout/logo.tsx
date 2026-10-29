import Link from "next/link";
import { Bandeirola } from "@/components/brand/bandeirola";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 rounded-lg focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
    >
      <span className="flex items-end gap-1" aria-hidden="true">
        <Bandeirola letra="M" cor="rosa" tamanho="sm" />
        <Bandeirola letra="D" cor="roxo" tamanho="sm" />
      </span>
      <span className="font-heading text-lg leading-tight font-semibold text-brand-ink">
        Mermãs
        <span className="block text-sm font-medium text-brand-purple">
          Digitais
        </span>
      </span>
    </Link>
  );
}
