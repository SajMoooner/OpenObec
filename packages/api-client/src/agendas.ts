import { bratislavaInstant } from "./dates";
export type AgendaSlug =
  "faktury" | "dodavatelske-faktury" | "zmluvy" | "objednavky" | "verejne-obstaravanie" | "vzn";
export type FieldKind = "text" | "textarea" | "date" | "datetime" | "money" | "select";
export interface Field {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  options?: { value: string; label: string }[];
}
export interface Agenda {
  slug: AgendaSlug;
  title: string;
  singular: string;
  party?: "odberatel" | "dodavatel" | "zmluvna_strana";
  partyLabel?: string;
  fields: Field[];
  related: AgendaSlug[];
}
const base: Field[] = [
  { key: "cislo", label: "Evidenčné číslo", kind: "text", required: true },
  { key: "predmet", label: "Predmet dokumentu", kind: "textarea", required: true },
];
const field = (key: string, label: string, kind: FieldKind, required = true): Field => ({
  key,
  label,
  kind,
  required,
});
const all: AgendaSlug[] = [
  "faktury",
  "dodavatelske-faktury",
  "zmluvy",
  "objednavky",
  "verejne-obstaravanie",
];
export const AGENDAS: Agenda[] = [
  {
    slug: "faktury",
    title: "Faktúry",
    singular: "Faktúra",
    party: "odberatel",
    partyLabel: "Odberateľ",
    fields: [
      ...base,
      field("datum_vystavenia", "Dátum vystavenia", "date"),
      field("datum_splatnosti", "Dátum splatnosti", "date"),
      field("suma_bez_dph", "Suma bez DPH (€)", "money"),
      field("suma_dph", "DPH (€)", "money"),
      field("suma_s_dph", "Suma s DPH (€)", "money"),
    ],
    related: ["verejne-obstaravanie", "objednavky", "zmluvy"],
  },
  {
    slug: "dodavatelske-faktury",
    title: "Dodávateľské faktúry",
    singular: "Dodávateľská faktúra",
    party: "dodavatel",
    partyLabel: "Dodávateľ",
    fields: [
      ...base,
      field("datum_vystavenia", "Dátum vystavenia", "date"),
      field("datum_splatnosti", "Dátum splatnosti", "date"),
      field("suma_bez_dph", "Suma bez DPH (€)", "money"),
      field("suma_dph", "DPH (€)", "money"),
      field("suma_s_dph", "Suma s DPH (€)", "money"),
    ],
    related: ["verejne-obstaravanie", "objednavky", "zmluvy"],
  },
  {
    slug: "zmluvy",
    title: "Zmluvy",
    singular: "Zmluva",
    party: "zmluvna_strana",
    partyLabel: "Zmluvná strana",
    fields: [
      ...base,
      field("datum_podpisu", "Dátum podpisu", "date"),
      field("datum_ucinnosti", "Dátum účinnosti", "date"),
      field("platnost_do", "Platnosť do", "date", false),
      field("suma_s_dph", "Suma s DPH (€)", "money"),
    ],
    related: all.filter((x) => x !== "zmluvy"),
  },
  {
    slug: "objednavky",
    title: "Objednávky",
    singular: "Objednávka",
    party: "dodavatel",
    partyLabel: "Dodávateľ",
    fields: [
      ...base,
      field("datum_objednania", "Dátum objednania", "date"),
      field("termin_dodania", "Termín dodania", "date", false),
      field("suma_s_dph", "Suma s DPH (€)", "money"),
    ],
    related: all.filter((x) => x !== "objednavky"),
  },
  {
    slug: "verejne-obstaravanie",
    title: "Verejné obstarávanie",
    singular: "Verejné obstarávanie",
    fields: [
      base[0],
      field("nazov", "Názov obstarávania", "text"),
      base[1],
      field("cpv", "CPV kód", "text"),
      field("predpokladana_hodnota_bez_dph", "Predpokladaná hodnota bez DPH (€)", "money"),
      field("lehota_predkladania", "Lehota predkladania ponúk", "datetime"),
      {
        key: "stav",
        label: "Stav obstarávania",
        kind: "select",
        required: true,
        options: [
          { value: "otvorene", label: "Otvorené" },
          { value: "vyhodnocovanie", label: "Vyhodnocovanie" },
          { value: "ukoncene", label: "Ukončené" },
          { value: "zrusene", label: "Zrušené" },
        ],
      },
    ],
    related: all.filter((x) => x !== "verejne-obstaravanie"),
  },
  {
    slug: "vzn",
    title: "VZN",
    singular: "Všeobecne záväzné nariadenie",
    fields: [
      base[0],
      field("nazov", "Názov nariadenia", "text"),
      base[1],
      field("datum_schvalenia", "Dátum schválenia", "date"),
      field("datum_ucinnosti", "Dátum účinnosti", "date"),
      field("platnost_do", "Platnosť do", "date", false),
    ],
    related: [],
  },
];
export function agendaFor(slug: string): Agenda | undefined {
  return AGENDAS.find((a) => a.slug === slug);
}
export interface Reference {
  typ: AgendaSlug;
  id: string;
}
export interface FieldError {
  field: string;
  code: string;
  message: string;
}
export class FormValidationError extends Error {
  constructor(public details: FieldError[]) {
    super("Skontrolujte vyznačené údaje.");
  }
}
export function toWritePayload(
  slug: AgendaSlug,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const agenda = agendaFor(slug)!;
  const out: Record<string, unknown> = {};
  const errors: FieldError[] = [];
  for (const f of agenda.fields) {
    let value = String(values[f.key] ?? "").trim();
    if (!value) {
      if (f.required)
        errors.push({
          field: f.key,
          code: "REQUIRED",
          message: `Vyplňte pole ${f.label.toLowerCase()}.`,
        });
      else out[f.key] = null;
      continue;
    }
    if (f.kind === "money") {
      value = value.replace(/\s/g, "").replace(",", ".");
      if (!/^\d+(\.\d{1,2})?$/.test(value))
        errors.push({
          field: f.key,
          code: "INVALID_VALUE",
          message: "Zadajte nezápornú sumu s najviac dvoma desatinnými miestami.",
        });
      else
        value =
          BigInt(value.split(".")[0]).toString() + "." + (value.split(".")[1] ?? "").padEnd(2, "0");
    }
    if (f.kind === "datetime") {
      try {
        value = bratislavaInstant(value);
      } catch (e) {
        errors.push({
          field: f.key,
          code: "INVALID_VALUE",
          message: e instanceof Error ? e.message : "Zadajte platný dátum a čas.",
        });
      }
    }
    out[f.key] = value;
  }
  if (agenda.party) {
    const p = (values[agenda.party] ?? {}) as Record<string, unknown>;
    const nazov = String(p.nazov ?? "").trim();
    const ico = String(p.ico ?? "").trim();
    if (!nazov)
      errors.push({
        field: `${agenda.party}.nazov`,
        code: "REQUIRED",
        message: "Vyplňte názov organizácie.",
      });
    if (ico && !/^\d{8}$/.test(ico))
      errors.push({
        field: `${agenda.party}.ico`,
        code: "INVALID_VALUE",
        message: "IČO musí mať 8 číslic.",
      });
    out[agenda.party] = { nazov, ico: ico || null };
  }
  if (slug !== "vzn") {
    out.mena = "EUR";
    out.suvisiace_zaznamy = values.suvisiace_zaznamy ?? [];
  }
  out.zverejnene = values.zverejnene === true;
  if (errors.length) throw new FormValidationError(errors);
  return out;
}
