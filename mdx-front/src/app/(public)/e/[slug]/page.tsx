import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { bannerSrc } from "@/components/admin/event-format";
import { EventHome } from "@/components/public/event-home";
import { loadEventPage } from "@/server/public-event";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await loadEventPage(slug);
  if (!event) {
    return { title: "Evento", robots: { index: false, follow: false } };
  }
  const description = shareText(event.description, event.theme, event.title);
  const image = bannerSrc(event.banner);
  return {
    title: event.title,
    description,
    robots: event.preview ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: event.title,
      description,
      type: "website",
      locale: "pt_BR",
      images: image ? [{ url: image, alt: `Banner do evento ${event.title}` }] : undefined,
    },
  };
}

export default function PublicEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-3xl px-4 py-10">
          <p>Carregando o evento…</p>
        </main>
      }
    >
      <PublicEventBody params={params} />
    </Suspense>
  );
}

async function PublicEventBody({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await loadEventPage(slug);
  if (event === null) notFound();
  if (!event) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <p>Não foi possível carregar o evento.</p>
      </main>
    );
  }

  return <EventHome event={event} />;
}

function shareText(description: string, theme: string, title: string): string {
  const source = description.trim() || theme.trim() || `Página do evento ${title}.`;
  const flat = source.replace(/\s+/g, " ");
  return flat.length > 180 ? `${flat.slice(0, 177)}…` : flat;
}
