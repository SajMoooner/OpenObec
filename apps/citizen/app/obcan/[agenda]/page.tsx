import { notFound } from "next/navigation";
import { agendaFor } from "@openobec/api-client";
import { DocumentList } from "@openobec/ui/features/list";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ agenda: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { agenda } = await params;
  const def = agendaFor(agenda);
  if (!def) notFound();
  const { q } = await searchParams;
  return <DocumentList agenda={def.slug} initialQuery={q ?? ""} />;
}

export async function generateMetadata({ params }: { params: Promise<{ agenda: string }> }) {
  const { agenda } = await params;
  return { title: "" + (agendaFor(agenda)?.title ?? "Dokumenty") };
}
