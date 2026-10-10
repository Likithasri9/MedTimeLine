import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { buildSnapshot } from "@/lib/snapshot";

export const dynamic = "force-dynamic";
const TITLES = { medications: "Medications", allergies: "Allergies", conditions: "Conditions" };

export default async function Health({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!(kind in TITLES)) notFound();
  const k = kind as keyof typeof TITLES;

  const docs = await sql`select doc_date, provider, extracted from documents
                         where confirmed = true order by doc_date desc`;
  const s = buildSnapshot(docs as any[]);

  const heads = k === "medications" ? ["Name", "Dose", "Frequency", "Prescribed by"]
    : k === "allergies" ? ["Allergy"] : ["Condition"];
  const rows: string[][] =
    k === "medications"
      ? s.meds.map((m: any) => [m.name, m.dose ?? "—", m.frequency ?? "—", m.provider ?? "—"])
      : k === "allergies" ? s.allergies.map(a => [a]) : s.conditions.map(c => [c]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold">{TITLES[k]}</h1>
      <p className="mt-1 text-gray-500">Built from your confirmed records.</p>
      <div className="mt-6 overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>{heads.map(h => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t">
                {r.map((c, j) => (
                  <td key={j} className={`px-5 py-4 ${k === "allergies" ? "font-semibold text-red-600" : ""}`}>{c}</td>
                ))}
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={heads.length} className="px-5 py-8 text-center text-gray-400">None recorded.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}