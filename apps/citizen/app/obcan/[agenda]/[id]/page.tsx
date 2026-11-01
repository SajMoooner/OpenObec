import { notFound } from "next/navigation";
import { agendaFor } from "@openobec/api-client";
import { DocumentDetail } from "@openobec/ui/features/detail";
export default async function Detail({
  params,
}: {
  params: Promise<{ agenda: string; id: string }>;
}) {
  const { agenda, id } = await params;
  const def = agendaFor(agenda);
  if (!def) notFound();
  return <DocumentDetail agenda={def.slug} id={id} />;
}
