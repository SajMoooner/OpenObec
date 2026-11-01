import { notFound } from "next/navigation";
import { agendaFor } from "@openobec/api-client";
import { DocumentList } from "@openobec/ui/features/list";
export default async function Page({ params }: { params: Promise<{ agenda: string }> }) {
  const { agenda } = await params;
  const def = agendaFor(agenda);
  if (!def) notFound();
  return <DocumentList agenda={def.slug} office />;
}
