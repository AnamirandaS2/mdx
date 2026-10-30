import { Suspense } from "react";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-brand-pink focus:px-3 focus:py-2 focus:text-white"
      >
        Ir para o conteúdo
      </a>
      <Suspense fallback={<div className="h-16 border-b border-brand-purple/15 bg-white" />}>
        <PublicHeader />
      </Suspense>
      <div id="conteudo" className="flex-1">
        {children}
      </div>
      <PublicFooter />
    </div>
  );
}
