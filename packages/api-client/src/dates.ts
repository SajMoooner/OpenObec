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
  return Number.isNaN(date.getTime()) ? "" : formatter.format(date).replace(" ", "T").slice(0, 16);
}
export function bratislavaInstant(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value))
    throw new Error("Zadajte platný dátum a čas.");
  const normalized = value.length === 16 ? value + ":00" : value;
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
  return new Date(instant).toISOString();
}
