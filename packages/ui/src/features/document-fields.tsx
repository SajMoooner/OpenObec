import {
  agendaFor,
  documentPresentation,
  formatDate,
  formatMoney,
  type AgendaSlug,
  type DocumentRecord,
} from "@openobec/api-client";
export function returnLabel(returnTo: string, fallback: string) {
  if (/\/(obcan|uradnik)\/home(?:\?|$)/.test(returnTo))
    return returnTo.includes("?") ? "Späť na výsledky vyhľadávania" : "Späť na prehľad";
  return fallback;
}
export function summaryFields(agenda: AgendaSlug, record: DocumentRecord) {
  const p = documentPresentation(agendaFor(agenda)!, record);
  return [
    ...(p.party ? [p.party] : []),
    { label: p.date.label, value: formatDate(p.date.value) },
    ...(p.secondaryDate
      ? [{ label: p.secondaryDate.label, value: formatDate(p.secondaryDate.value) }]
      : []),
    ...(p.amount ? [{ label: p.amount.label, value: formatMoney(p.amount.value) }] : []),
  ];
}
export function DocumentSummary({
  agenda,
  record,
}: {
  agenda: AgendaSlug;
  record: DocumentRecord;
}) {
  return (
    <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
      {summaryFields(agenda, record).map((field) => (
        <div key={field.label}>
          <dt className="text-sm text-muted-foreground">{field.label}</dt>
          <dd className="mt-1 break-words text-base font-medium">{field.value}</dd>
        </div>
      ))}
    </dl>
  );
}
