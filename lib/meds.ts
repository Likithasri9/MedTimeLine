const CLASSES: Record<string, string> = {
  amlodipine: "CCB", nifedipine: "CCB",
  telmisartan: "ARB", losartan: "ARB", olmesartan: "ARB",
  enalapril: "ACEi", ramipril: "ACEi",
  metformin: "Biguanide", glimepiride: "Sulfonylurea",
};

const BRANDS: Record<string, string> = {
  amlokind: "amlodipine", telma: "telmisartan", glycomet: "metformin",
  amaryl: "glimepiride", cozaar: "losartan",
};

export const generic = (n: string) => BRANDS[n.toLowerCase()] ?? n.toLowerCase();

type Med = { name: string; provider: string };

export function findDuplicates(meds: Med[]) {
  const byClass = new Map<string, Med[]>();
  for (const m of meds) {
    const c = CLASSES[generic(m.name)];
    if (c) byClass.set(c, [...(byClass.get(c) ?? []), m]);
  }
  return [...byClass]
    .filter(([, v]) => new Set(v.map(x => x.provider)).size > 1)
    .map(([cls, items]) => ({ cls, items }));
}