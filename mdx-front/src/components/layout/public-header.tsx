"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Logo } from "@/components/layout/logo";
import { canAccessAdmin, type AuthUser } from "@/server/permissions";
import { cn } from "cn";

export function PublicHeader() {
  const pathname = usePathname();
  const { data } = useSession();
  const user: AuthUser | null =
    data?.user?.id && data.user.role
      ? {
          id: data.user.id,
          role: data.user.role,
          memberships: data.user.memberships ?? [],
        }
      : null;

  const links = [
    { href: "/", label: "Início" },
    { href: "/design-system", label: "Design system" },
    ...(user && canAccessAdmin(user) ? [{ href: "/admin", label: "Painel" }] : []),
    user
      ? { href: "/conta", label: "Minha conta" }
      : { href: "/entrar", label: "Entrar" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[#330043]/10 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
        <Logo />
        <nav aria-label="Principal" className="flex flex-1 flex-wrap items-center justify-end gap-1">
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
                  "inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-medium text-brand-purple focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none",
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
