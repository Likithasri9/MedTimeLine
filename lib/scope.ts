import { generic } from "./meds";

const CONDITIONS: Record<string, { dx: RegExp; labs: RegExp; meds: RegExp }> = {
  diabetes: { dx: /diabet/i, labs: /hba1c|glucose|creatinine/i, meds: /^(metformin|glimepiride)$/ },
  hypertension: {
    dx: /hypertens/i, labs: /creatinine|potassium/i,
    meds: /^(telmisartan|losartan|olmesartan|amlodipine|nifedipine|enalapril|ramipril)$/,
  },
};

export function applyScope(docs: any[], scope: { all?: boolean; condition?: string }) {
  if (scope?.all) return docs;
  const c = CONDITIONS[(scope?.condition ?? "").toLowerCase()];
  if (!c) return [];
  return docs
    .map(d => {
      const x = d.extracted ?? {};
      return {
        ...d,
        extracted: {
          ...x,
          diagnoses: (x.diagnoses ?? []).filter((t: string) => c.dx.test(t)),
          meds: (x.meds ?? []).filter((m: any) => c.meds.test(generic(m.generic ?? m.name))),
          labs: (x.labs ?? []).filter((l: any) => c.labs.test(l.name)),
          allergies: x.allergies ?? [], // always shared: safety-critical
        },
      };
    })
    .filter(d => d.extracted.diagnoses.length || d.extracted.meds.length || d.extracted.labs.length);
}