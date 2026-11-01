const formatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Bratislava",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});
export function localBratislavaInput(value: unknown): string {
  if (typeof value !== "string" || !value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = formatter.format(date).replace(" ", "T");
  const fraction = String(date.getUTCMilliseconds()).padStart(3, "0").replace(/0+$/, "");
  return fraction ? `${local}.${fraction}` : local.endsWith(":00") ? local.slice(0, 16) : local;
}
export function bratislavaInstant(value: string, original?: unknown): string {
  // A local clock value cannot distinguish the two autumn overlap occurrences.
  // Keep the server instant (including sub-millisecond precision) if it is unchanged.
  if (typeof original === "string" && value && value === localBratislavaInput(original))
    return original;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/.test(value))
    throw new Error("Zadajte platný dátum a čas.");
  const [clock, fraction = ""] = value.split(".");
  const normalized = clock.length === 16 ? clock + ":00" : clock;
  const wall = Date.parse(normalized + "Z");
  if (!Number.isFinite(wall)) throw new Error("Zadajte platný dátum a čas.");
  let instant = wall;
  for (let i = 0; i < 4; i++) {
    const local = formatter.format(new Date(instant)).replace(" ", "T");
    const correction = wall - Date.parse(local + "Z");
    if (!correction) break;
    instant += correction;
  }
  if (formatter.format(new Date(instant)).replace(" ", "T") !== normalized)
    throw new Error("Zadaný miestny čas v pásme Europe/Bratislava neexistuje. Vyberte iný čas.");
  return new Date(instant + Number(fraction.padEnd(3, "0"))).toISOString();
}
