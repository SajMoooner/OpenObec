import { notFound } from "next/navigation";
import { agendaFor } from "@openobec/api-client";
import { EditorPage } from "@openobec/ui/features/editor";
export default async function New({ params }: { params: Promise<{ agenda: string }> }) {
  const { agenda } = await params;
  const def = agendaFor(agenda);
  if (!def) notFound();
  return <EditorPage agenda={def.slug} />;
}
