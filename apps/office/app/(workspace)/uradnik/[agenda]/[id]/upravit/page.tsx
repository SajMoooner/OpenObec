import { notFound } from "next/navigation";
import { agendaFor } from "@openobec/api-client";
import { EditorPage } from "@openobec/ui/features/editor";
export default async function Edit({
  params,
}: {
  params: Promise<{ agenda: string; id: string }>;
}) {
  const { agenda, id } = await params;
  const def = agendaFor(agenda);
  if (!def) notFound();
  return <EditorPage agenda={def.slug} id={id} />;
}

export async function generateMetadata({ params }: { params: Promise<{ agenda: string }> }) {
  const { agenda } = await params;
  return { title: "Úprava dokumentu · " + (agendaFor(agenda)?.title ?? "Dokumenty") };
}
