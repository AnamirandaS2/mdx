"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { cn } from "cn";

const links = [
  { href: "/", label: "Início" },
  { href: "/design-system", label: "Design system" },
  { href: "/admin", label: "Painel" },
];

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-brand-purple/15 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <nav aria-label="Principal" className="flex flex-wrap items-center gap-1">
          {links.map((link) => {
            const ativo =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-brand-purple focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none",
                  ativo ? "bg-brand-lilac text-brand-ink" : "hover:bg-brand-lilac",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex h-1.5" aria-hidden="true">
        <span className="flex-1 bg-brand-pink" />
        <span className="flex-1 bg-brand-purple-bright" />
        <span className="flex-1 bg-brand-purple" />
        <span className="flex-1 bg-brand-pink-dark" />
      </div>
    </header>
  );
}
