import QRCode from "qrcode";
import { sql } from "@/lib/db";
import { buildSnapshot } from "@/lib/snapshot";

export const dynamic = "force-dynamic";
// Demo values: fictional
const PROFILE = { name: "Ravi Kumar, 52 M", blood: "B+", contact: "Anita Kumar (spouse) · +91 90000 00000" };

export default async function Emergency() {
  const docs = await sql`select doc_date, provider, extracted from documents
                         where confirmed = true order by doc_date desc`;
  const s = buildSnapshot(docs as any[]);
  try { await sql`insert into emergency_log default values`; } catch {}
  const qr = await QRCode.toDataURL(`${process.env.APP_URL ?? "http://localhost:3000"}/emergency`, { margin: 1, width: 180 });

  return (
    <main className="mx-auto max-w-xl space-y-4 p-6">
      <div className="rounded bg-red-600 p-4 text-white">
        <h1 className="text-2xl font-bold">EMERGENCY SUMMARY</h1>
        <p>{PROFILE.name} · Blood group <b>{PROFILE.blood}</b></p>
      </div>
      <section className="rounded border-2 border-red-500 p-4">
        <h2 className="font-bold text-red-600">ALLERGIES</h2>
        <p className="text-xl font-semibold">{s.allergies.length ? s.allergies.join(", ") : "None recorded"}</p>
      </section>
      <section className="rounded border p-4"><h2 className="font-semibold">Conditions</h2>
        <p>{s.conditions.join(", ") || "None recorded"}</p></section>
      <section className="rounded border p-4"><h2 className="font-semibold">Current medicines</h2>
        <ul>{s.meds.map((m: any) => <li key={m.name}>{m.name} {m.dose} {m.frequency}</li>)}</ul></section>
      <section className="rounded border p-4"><h2 className="font-semibold">Emergency contact</h2>
        <p>{PROFILE.contact}</p></section>
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <img src={qr} alt="QR to this page" width={120} height={120} />
        <p>Critical information only. Access to this page is logged. Print or save this QR to the lock screen.</p>
      </div>
    </main>
  );
}