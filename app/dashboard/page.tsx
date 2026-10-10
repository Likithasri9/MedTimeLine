import { sql } from "@/lib/db";
import { findDuplicates, generic } from "@/lib/meds";
import HbaChart from "./HbaChart";

export const dynamic = "force-dynamic";
const fmt = (d: any) => new Date(d).toISOString().slice(0, 10);

export default async function Dashboard() {
  const docs: any[] = await sql`
    select id, doc_type, doc_date, provider, extracted from documents
    where confirmed = true order by doc_date desc`;

  // Active meds: latest entry per generic name
  const meds = new Map<string, any>();
  for (const d of [...docs].reverse())
    for (const m of d.extracted?.meds ?? [])
      meds.set(generic(m.generic ?? m.name), { ...m, provider: d.provider, date: fmt(d.doc_date) });
  const medList = [...meds.values()];

  const conditions = [...new Set(docs.flatMap(d => d.extracted?.diagnoses ?? []))];
  const allergies = [...new Set(docs.flatMap(d => d.extracted?.allergies ?? []))];
  const dupes = findDuplicates(medList.map(m => ({ name: m.name, provider: m.provider })));

  const hba = docs
    .flatMap(d => (d.extracted?.labs ?? []).filter((l: any) => /hba1c/i.test(l.name))
      .map((l: any) => ({ date: fmt(d.doc_date), value: l.value })))
    .sort((a, b) => a.date.localeCompare(b.date));
  const last = hba.at(-1);
  const daysAgo = last ? Math.floor((Date.now() - new Date(last.date).getTime()) / 86400000) : null;

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Health snapshot</h1>

      {dupes.map(d => (
        <div key={d.cls} className="rounded border border-amber-400 bg-amber-50 p-3 text-sm">
          ⚠️ Possible duplicate therapy ({d.cls}): {d.items.map(i => `${i.name} (${i.provider})`).join(" + ")}.
          Ask your doctor before taking both.
        </div>
      ))}
      {daysAgo !== null && daysAgo < 90 && (
        <div className="rounded border border-blue-300 bg-blue-50 p-3 text-sm">
          🧪 HbA1c was done {daysAgo} days ago (<b>{last!.value}%</b>). A repeat test may not be needed yet.
        </div>
      )}

      <section className="grid gap-4 rounded border p-4 sm:grid-cols-3">
        <div><h2 className="font-semibold">Conditions</h2><ul>{conditions.map(c => <li key={c}>{c}</li>)}</ul></div>
        <div><h2 className="font-semibold text-red-600">Allergies</h2>
          <ul>{allergies.length ? allergies.map(a => <li key={a}>{a}</li>) : <li>None recorded</li>}</ul></div>
        <div><h2 className="font-semibold">Current medicines</h2>
          <ul>{medList.map(m => <li key={m.name}>{m.name} {m.dose} <span className="text-xs text-gray-500">({m.provider})</span></li>)}</ul></div>
      </section>

      {hba.length > 1 && <section><h2 className="font-semibold">HbA1c trend</h2><HbaChart data={hba} /></section>}

      <section>
        <h2 className="mb-2 font-semibold">Timeline</h2>
        <ol className="space-y-3 border-l-2 pl-4">
          {docs.map(d => (
            <li key={d.id}>
              <div className="text-xs text-gray-500">{fmt(d.doc_date)} · {d.doc_type.replace("_", " ")}</div>
              <div className="font-medium">{d.provider}</div>
              <div className="text-sm">{[...(d.extracted?.diagnoses ?? []),
                ...(d.extracted?.meds ?? []).map((m: any) => `${m.name} ${m.dose}`),
                ...(d.extracted?.labs ?? []).map((l: any) => `${l.name} ${l.value}${l.unit ?? ""}`)].join(" · ")}</div>
              <a className="text-xs text-blue-600" href={`/api/doc/${d.id}`}>View original</a>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}