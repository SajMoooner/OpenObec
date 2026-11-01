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
test("local deadline input retains seconds and browser-supported fractional precision", () => {
  assert.equal(localBratislavaInput("2026-11-01T09:30:45.123456Z"), "2026-11-01T10:30:45.123");
  assert.equal(localBratislavaInput("2026-11-01T09:30:00.120Z"), "2026-11-01T10:30:00.12");
});
test("unchanged local deadline preserves the exact instant and either autumn occurrence", () => {
  for (const original of [
    "2026-11-01T09:30:45.123456Z",
    "2026-10-25T00:30:45.123456Z",
    "2026-10-25T01:30:45.123456Z",
  ])
    assert.equal(bratislavaInstant(localBratislavaInput(original), original), original);
});
test("a deliberate local deadline edit converts seconds and fractions instead of retaining the original", () => {
  assert.equal(
    bratislavaInstant("2026-11-01T11:31:46.12", "2026-11-01T09:30:45.123456Z"),
    "2026-11-01T10:31:46.120Z",
  );
  assert.throws(
    () => bratislavaInstant("2026-03-29T02:30:45.123", "2026-03-29T00:30:45.123Z"),
    /neexistuje/,
  );
});
