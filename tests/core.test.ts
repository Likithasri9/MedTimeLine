import { describe, it, expect } from "vitest";
import { newToken, hashToken, isValid } from "@/lib/tokens";
import { findDuplicates, generic } from "@/lib/meds";
import { applyScope } from "@/lib/scope";

describe("share tokens", () => {
  it("generates unique 256-bit tokens and stores only a hash", () => {
    const a = newToken(), b = newToken();
    expect(a).toHaveLength(64);
    expect(a).not.toBe(b);
    expect(hashToken(a)).toBe(hashToken(a));
    expect(hashToken(a)).not.toBe(a);
  });
  it("rejects expired and revoked links, accepts live ones", () => {
    const future = new Date(Date.now() + 3600_000);
    expect(isValid({ revoked: false, expires_at: new Date(Date.now() - 1000) })).toBe(false);
    expect(isValid({ revoked: true, expires_at: future })).toBe(false);
    expect(isValid({ revoked: false, expires_at: future })).toBe(true);
  });
});

describe("duplicate medicine detection", () => {
  it("maps brand names to generics", () => expect(generic("Telma")).toBe("telmisartan"));
  it("flags same class from different providers", () => {
    const r = findDuplicates([{ name: "Telma", provider: "Dr A" }, { name: "Losartan", provider: "Dr B" }]);
    expect(r).toHaveLength(1);
    expect(r[0].cls).toBe("ARB");
  });
  it("does not flag the same provider or different classes", () => {
    expect(findDuplicates([{ name: "Telma", provider: "Dr A" }, { name: "Losartan", provider: "Dr A" }])).toHaveLength(0);
    expect(findDuplicates([{ name: "Telma", provider: "Dr A" }, { name: "Metformin", provider: "Dr B" }])).toHaveLength(0);
  });
});

describe("server-side scope", () => {
  const docs = [
    { extracted: { diagnoses: ["Type 2 diabetes", "Hypertension"], allergies: ["Penicillin"],
        meds: [{ name: "Telma", generic: "telmisartan" }, { name: "Metformin", generic: "metformin" }],
        labs: [{ name: "HbA1c", value: 8.1 }] } },
    { extracted: { diagnoses: ["Hypertension"], allergies: [], meds: [{ name: "Losartan", generic: "losartan" }], labs: [] } },
  ];
  it("diabetes scope strips hypertension-only data", () => {
    const r = applyScope(docs, { condition: "diabetes" });
    expect(r).toHaveLength(1);
    expect(r[0].extracted.meds.map((m: any) => m.name)).toEqual(["Metformin"]);
    expect(r[0].extracted.labs[0].name).toBe("HbA1c");
    expect(r[0].extracted.allergies).toEqual(["Penicillin"]);
  });
  it("unknown condition shares nothing; 'all' shares everything", () => {
    expect(applyScope(docs, { condition: "asthma" })).toHaveLength(0);
    expect(applyScope(docs, { all: true })).toHaveLength(2);
  });
});