import { generic } from "./meds";

export function buildSnapshot(docs: any[]) {
  // docs must be newest-first
  const meds = new Map<string, any>();
  for (const d of [...docs].reverse())
    for (const m of d.extracted?.meds ?? [])
      meds.set(generic(m.generic ?? m.name), { ...m, provider: d.provider });
  return {
    meds: [...meds.values()],
    conditions: [...new Set(docs.flatMap(d => d.extracted?.diagnoses ?? []))] as string[],
    allergies: [...new Set(docs.flatMap(d => d.extracted?.allergies ?? []))] as string[],
  };
}