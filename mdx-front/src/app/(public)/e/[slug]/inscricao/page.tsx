import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SteppedRegistration } from "@/components/public/stepped-registration";
import { auth } from "@/auth";
import type { FormFieldConfig } from "@/server/form-schema";
import { loadEventPage } from "@/server/public-event";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await loadEventPage(slug);
  if (!event) return { title: "Inscrição", robots: { index: false, follow: false } };
  return {
    title: `Inscrição · ${event.title}`,
    description: `Inscrição no evento ${event.title}.`,
    robots: event.preview ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export default function RegistrationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-3xl px-4 py-10">
          <p>Carregando a inscrição…</p>
        </main>
      }
    >
      <RegistrationBody params={params} />
    </Suspense>
  );
}

async function RegistrationBody({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [event, session] = await Promise.all([loadEventPage(slug), auth()]);
  if (event === null) notFound();
  if (!event) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <p>Não foi possível carregar o evento.</p>
      </main>
    );
  }

  const open = event.status === "PUBLISHED" && event.registrationsOpen && !event.preview;

  return (
    <main className="bg-[#FFF6FB] text-[#330043]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="relative overflow-hidden rounded-[2rem] border-4 border-[#330043] bg-[#FF4A97] p-5 shadow-[8px_8px_0_#330043]">
          <img src="/marca/banner-lp.jpg" alt="" className="w-full rounded-3xl" />
          <img src="/marca/vem-ser-digital.svg" alt="Vem ser digital!" className="mt-4 w-40" />
          <p className="mt-3 font-heading text-3xl">Sua inscrição</p>
          <p className="mt-2 font-semibold">Um passo de cada vez. Dá para voltar e corrigir antes de enviar.</p>
          <Link href={`/e/${event.slug}`} className="mt-4 inline-flex min-h-11 items-center font-bold underline">
            Voltar para o evento
          </Link>
        </div>
        <div className="rounded-[2rem] border-4 border-[#330043] bg-white p-5 shadow-[8px_8px_0_#FFCD34] sm:p-8">
          {event.preview ? (
            <p role="status" className="mb-4 rounded-2xl bg-[#FFCD34] px-4 py-3 font-bold">
              Este evento ainda é um rascunho. O envio não vale como inscrição.
            </p>
          ) : null}
          {!open && !event.preview ? (
            <p role="status" className="mb-4 font-bold">
              As inscrições deste evento estão encerradas.
            </p>
          ) : null}
          <SteppedRegistration
            fields={(event.fields ?? []) as FormFieldConfig[]}
            slug={event.slug}
            preview={event.preview}
            closed={!open && !event.preview}
            defaultName={session?.user?.name ?? ""}
            defaultEmail={session?.user?.email ?? ""}
          />
        </div>
      </div>
    </main>
  );
}
