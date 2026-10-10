import { sql } from "@/lib/db";
import { hashToken, isValid } from "@/lib/tokens";
import { applyScope } from "@/lib/scope";
import { buildSnapshot } from "@/lib/snapshot";
import { findDuplicates } from "@/lib/meds";

export const dynamic = "force-dynamic";
const fmt = (d: any) => new Date(d).toISOString().slice(0, 10);

function Msg({ title, text }: { title: string; text: string }) {
  return (
    <main className="mx-auto max-w-md p-10 text-center">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="mt-2 text-gray-600">{text}</p>
    </main>
  );
}

export default async function DoctorView({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [share] = await sql`select * from shares where token_hash = ${hashToken(token)}`;
  if (!share) return <Msg title="Invalid link" text="This link does not exist." />;

  if (!isValid(share as any)) {
    await sql`insert into audit (share_id, outcome)
              values (${share.id}, ${share.revoked ? "denied_revoked" : "denied_expired"})`;
    return <Msg title="Access ended" text="This link has expired or was revoked by the patient." />;
  }
  await sql`insert into audit (share_id, outcome) values (${share.id}, 'viewed')`;

  const all = await sql`select id, doc_type, doc_date, provider, extracted
                        from documents where confirmed = true order by doc_date desc`;
  const docs = applyScope(all as any[], share.scope); // scope enforced on the server
  const snap = buildSnapshot(docs);
  const dupes = findDuplicates(snap.meds.map((m: any) => ({ name: m.name, provider: m.provider })));

  return (
    <main className="mx-auto max-w-3xl space-y-5 p-6">
      <header className="rounded bg-slate-900 p-4 text-white">
        <h1 className="text-lg font-bold">Patient summary (read-only)</h1>
        <p className="text-sm text-slate-300">
          Shared scope: {share.scope.all ? "full history" : share.scope.condition} · Link expires{" "}
          {new Date(share.expires_at).toLocaleString()}
        </p>
      </header>

      {dupes.map(d => (
        <div key={d.cls} className="rounded border border-amber-400 bg-amber-50 p-3 text-sm">
          ⚠️ Overlapping {d.cls} prescriptions: {d.items.map(i => `${i.name} (${i.provider})`).join(" + ")}
        </div>
      ))}

      <section className="grid gap-4 rounded border p-4 sm:grid-cols-3">
        <div><h2 className="font-semibold">Conditions</h2>
          <ul>{snap.conditions.map(c => <li key={c}>{c}</li>)}</ul></div>
        <div><h2 className="font-semibold text-red-600">Allergies</h2>
          <ul>{snap.allergies.length ? snap.allergies.map(a => <li key={a}>{a}</li>) : <li>None recorded</li>}</ul></div>
        <div><h2 className="font-semibold">Current medicines</h2>
          <ul>{snap.meds.map((m: any) => <li key={m.name}>{m.name} {m.dose}</li>)}</ul></div>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Timeline</h2>
        <ol className="space-y-3 border-l-2 pl-4">
          {docs.map((d: any) => (
            <li key={d.id}>
              <div className="text-xs text-gray-500">{fmt(d.doc_date)} · {String(d.doc_type).replace("_", " ")}</div>
              <div className="font-medium">{d.provider}</div>
              <div className="text-sm">
                {[...d.extracted.diagnoses,
                  ...d.extracted.meds.map((m: any) => `${m.name} ${m.dose ?? ""}`),
                  ...d.extracted.labs.map((l: any) => `${l.name} ${l.value}${l.unit ?? ""}`)].join(" · ")}
              </div>
            </li>
          ))}
        </ol>
      </section>
      <p className="text-xs text-gray-500">
        Patient-confirmed records. A record-keeping aid, not a diagnostic tool. This access has been logged.
      </p>
    </main>
  );
}