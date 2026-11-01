import test from "node:test";
import assert from "node:assert/strict";
import { bratislavaInstant, localBratislavaInput } from "../src/dates.ts";
test("winter wall clock is interpreted in Bratislava even on a UTC host", () => {
  assert.equal(bratislavaInstant("2026-11-01T10:30"), "2026-11-01T09:30:00.000Z");
});
test("summer clock uses Bratislava daylight saving time", () => {
  assert.equal(bratislavaInstant("2026-07-01T10:30"), "2026-07-01T08:30:00.000Z");
  assert.equal(localBratislavaInput("2026-07-01T08:30:00Z"), "2026-07-01T10:30");
});
test("nonexistent spring clock is rejected rather than silently shifted", () => {
  assert.throws(() => bratislavaInstant("2026-03-29T02:30"), /neexistuje/);
});
