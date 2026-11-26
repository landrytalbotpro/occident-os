import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { currentOccurrence, isDue, parseYMD, pendingOccurrence } from "./occurrence.ts";

describe("currentOccurrence", () => {
  it("mes posterior: este año", () => {
    const o = currentOccurrence(9, parseYMD("2026-03-10"));
    assert.equal(o.date, "2026-09-01");
    assert.equal(o.daysUntil, 175);
  });

  it("mes ya pasado: año siguiente", () => {
    const o = currentOccurrence(3, parseYMD("2026-11-26"));
    assert.equal(o.date, "2027-03-01");
    assert.equal(o.year, 2027);
  });

  it("diciembre → enero: enero es del año siguiente", () => {
    const o = currentOccurrence(1, parseYMD("2026-12-15"));
    assert.equal(o.date, "2027-01-01");
    assert.equal(o.daysUntil, 17);
  });

  it("31 de diciembre → enero: 1 día", () => {
    assert.equal(currentOccurrence(1, parseYMD("2026-12-31")).daysUntil, 1);
  });

  it("mes en curso: este año, días negativos (ya ha empezado)", () => {
    const o = currentOccurrence(11, parseYMD("2026-11-26"));
    assert.equal(o.date, "2026-11-01");
    assert.equal(o.daysUntil, -25);
  });

  it("mes en curso el día 1: 0 días", () => {
    assert.equal(currentOccurrence(11, parseYMD("2026-11-01")).daysUntil, 0);
  });

  it("año bisiesto: febrero cuenta 29 días", () => {
    assert.equal(currentOccurrence(3, parseYMD("2028-02-01")).daysUntil, 29);
  });
});

describe("isDue", () => {
  const today = parseYMD("2026-11-26");

  it("dentro de 90 días y sin tratar", () => {
    assert.equal(isDue(1, null, today), true); // 1 ene 2027: 36 días
    assert.equal(isDue(2, null, today), true); // 1 feb 2027: 67 días
  });

  it("fuera de 90 días", () => {
    assert.equal(isDue(3, null, today), false); // 1 mar 2027: 95 días
    assert.equal(isDue(10, null, today), false); // 1 oct 2027
  });

  it("límite exacto de 90 días incluido", () => {
    // 2026-12-03 → 2027-03-01 = 88; 2026-12-01 → 2027-03-01 = 90
    assert.equal(isDue(3, null, parseYMD("2026-12-01")), true);
    assert.equal(isDue(3, null, parseYMD("2026-11-30")), false); // 91
  });

  it("mes en curso sin tratar: sigue a llamar", () => {
    assert.equal(isDue(11, null, today), true);
  });

  it("handled_year = año de la ocurrencia: no se muestra", () => {
    assert.equal(isDue(1, 2027, today), false);
    assert.equal(isDue(11, 2026, today), false);
  });

  it("handled_year de un año anterior: vuelve a aparecer", () => {
    assert.equal(isDue(1, 2026, today), true);
    assert.equal(isDue(11, 2025, today), true);
  });

  it("diciembre → enero con handled_year del enero anterior", () => {
    const dec = parseYMD("2026-12-20");
    assert.equal(isDue(1, 2026, dec), true); // enero 2027 pendiente
    assert.equal(isDue(1, 2027, dec), false);
  });

  it("tratado este año, al pasar el mes vuelve el año siguiente", () => {
    // Septiembre 2026 tratado; en julio 2027 la ocurrencia es sept 2027 (62 días)
    assert.equal(isDue(9, 2026, parseYMD("2027-07-01")), true);
  });
});

describe("pendingOccurrence", () => {
  const today = parseYMD("2026-11-26");

  it("sin tratar: la vigente", () => {
    assert.equal(pendingOccurrence(1, null, today).date, "2027-01-01");
  });

  it("vigente ya tratada: la del año siguiente", () => {
    assert.equal(pendingOccurrence(1, 2027, today).date, "2028-01-01");
    assert.equal(pendingOccurrence(11, 2026, today).date, "2027-11-01");
  });
});
