import { AGENDAS, type Agenda } from "./agendas";
export function documentPresentation(
  agenda: Agenda,
  data: Record<string, unknown>,
): {
  party?: { label: string; value: string };
  date: { label: string; value: unknown };
  amount?: { label: string; value: unknown };
  secondaryDate?: { label: string; value: unknown };
} {
  const dateKey =
    agenda.slug === "zmluvy"
      ? "datum_ucinnosti"
      : agenda.slug === "objednavky"
        ? "datum_objednania"
        : agenda.slug === "verejne-obstaravanie"
          ? "lehota_predkladania"
          : agenda.slug === "vzn"
            ? "datum_schvalenia"
            : "datum_vystavenia";
  const date = { label: agenda.fields.find((f) => f.key === dateKey)!.label, value: data[dateKey] };
  const party = agenda.party
    ? {
        label: agenda.partyLabel!,
        value: String((data[agenda.party] as { nazov?: string } | undefined)?.nazov || "—"),
      }
    : agenda.slug === "verejne-obstaravanie"
      ? {
          label: "Stav obstarávania",
          value:
            agenda.fields.find((f) => f.key === "stav")?.options?.find((o) => o.value === data.stav)
              ?.label ?? "—",
        }
      : undefined;
  return {
    party,
    date,
    ...(agenda.slug === "vzn"
      ? { secondaryDate: { label: "Dátum účinnosti", value: data.datum_ucinnosti } }
      : {
          amount: {
            label:
              agenda.slug === "verejne-obstaravanie"
                ? "Predpokladaná hodnota bez DPH"
                : "Suma s DPH",
            value:
              data[
                agenda.slug === "verejne-obstaravanie"
                  ? "predpokladana_hodnota_bez_dph"
                  : "suma_s_dph"
              ],
          },
        }),
  };
}
export function safeReturnTo(value: string | null | undefined, fallback: string): string {
  if (!value || /[\\#\s\u0000-\u001f]/.test(value)) return fallback;
  try {
    decodeURIComponent(value);
    const prefix = fallback.split("/")[1];
    const path = value.split("?")[0];
    if (
      !["obcan", "uradnik"].includes(prefix) ||
      ![`/${prefix}/home`, ...AGENDAS.map((a) => `/${prefix}/${a.slug}`)].includes(path)
    )
      return fallback;
    return value;
  } catch {
    return fallback;
  }
}
