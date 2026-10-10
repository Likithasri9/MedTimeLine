"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Med = { name: string; generic: string | null; dose: string; frequency: string };
type Lab = { name: string; value: string; unit: string };
type FormState = {
  doc_type: string; date: string; provider: string; diagnoses: string; allergies: string;
  meds: Med[]; labs: Lab[]; low: string[];
};

const MAX = 4 * 1024 * 1024;
const csv = (s: string) => s.split(",").map(x => x.trim()).filter(Boolean);
const inp = "w-full rounded border p-2 text-sm";
const empty: FormState = { doc_type: "other", date: "", provider: "", diagnoses: "", allergies: "", meds: [], labs: [], low: [] };

export default function UploadPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [docId, setDocId] = useState<number | null>(null);
  const [mime, setMime] = useState("");
  const [manual, setManual] = useState(false);
  const [f, setF] = useState<FormState | null>(null);

  const set = (p: Partial<FormState>) => setF(s => (s ? { ...s, ...p } : s));
  const flag = (...keys: string[]) =>
    f?.low.some(l => keys.some(k => l.toLowerCase().includes(k))) ? " border-yellow-500 bg-yellow-50" : "";

  async function onFile(file: File) {
    setErr("");
    if (file.size > MAX) return setErr("File is over 4 MB. Please upload a smaller file.");
    if (!["application/pdf", "image/png", "image/jpeg"].includes(file.type))
      return setErr("Only PDF, PNG or JPG files are supported.");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) return setErr(j.error ?? "Upload failed");
      const x = j.extracted;
      setDocId(j.id); setMime(file.type); setManual(!x);
      setF(x ? {
        doc_type: x.doc_type, date: x.date ?? "", provider: x.provider ?? "",
        diagnoses: x.diagnoses.join(", "), allergies: x.allergies.join(", "),
        meds: x.meds.map((m: any) => ({ name: m.name, generic: m.generic, dose: m.dose ?? "", frequency: m.frequency ?? "" })),
        labs: x.labs.map((l: any) => ({ name: l.name, value: String(l.value), unit: l.unit ?? "" })),
        low: x.low_confidence_fields,
      } : empty);
    } catch {
      setErr("Upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!f || !docId) return;
    if (!f.date) return setErr("Please enter the document date.");
    const body = {
      doc_type: f.doc_type, date: f.date, provider: f.provider || null,
      diagnoses: csv(f.diagnoses), allergies: csv(f.allergies),
      meds: f.meds.filter(m => m.name.trim()).map(m => ({
        name: m.name.trim(), generic: m.generic, dose: m.dose || null, frequency: m.frequency || null })),
      labs: f.labs.filter(l => l.name.trim() && l.value !== "" && !isNaN(Number(l.value)))
        .map(l => ({ name: l.name.trim(), value: Number(l.value), unit: l.unit || null })),
      low_confidence_fields: [],
    };
    const res = await fetch(`/api/doc/${docId}/confirm`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (!res.ok) return setErr((await res.json().catch(() => ({}))).error ?? "Save failed");
    router.push("/dashboard");
  }

  if (!f)
    return (
      <main className="mx-auto max-w-xl space-y-4 p-6">
        <h1 className="text-2xl font-bold">Add a record</h1>
        <p className="text-sm text-gray-600">Prescription, lab report or discharge summary (PDF, PNG, JPG, up to 4 MB).</p>
        <input type="file" accept="application/pdf,image/png,image/jpeg" disabled={busy}
          onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} className={inp} />
        {busy && <p className="text-sm">Reading your document… this can take 10 to 20 seconds.</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}
      </main>
    );

  return (
    <main className="mx-auto grid max-w-6xl gap-6 p-6 md:grid-cols-2">
      <section>
        <h2 className="mb-2 font-semibold">Original</h2>
        {mime === "application/pdf"
          ? <iframe src={`/api/doc/${docId}`} className="h-[75vh] w-full rounded border" />
          : <img src={`/api/doc/${docId}`} alt="Uploaded record" className="w-full rounded border" />}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Check what we found</h2>
        <p className="text-sm text-gray-600">
          {manual ? "We couldn't read this file automatically. Please enter the details."
                  : "Yellow fields were hard to read. Please confirm them against the original."}
        </p>
        <label className="block text-sm">Type
          <select className={inp} value={f.doc_type} onChange={e => set({ doc_type: e.target.value })}>
            <option value="prescription">Prescription</option>
            <option value="lab_report">Lab report</option>
            <option value="discharge_summary">Discharge summary</option>
            <option value="other">Other</option>
          </select></label>
        <label className="block text-sm">Date
          <input type="date" className={inp + flag("date")} value={f.date} onChange={e => set({ date: e.target.value })} /></label>
        <label className="block text-sm">Doctor / provider
          <input className={inp + flag("provider", "doctor")} value={f.provider} onChange={e => set({ provider: e.target.value })} /></label>
        <label className="block text-sm">Diagnoses (comma separated)
          <input className={inp + flag("diagnos")} value={f.diagnoses} onChange={e => set({ diagnoses: e.target.value })} /></label>
        <label className="block text-sm">Allergies (comma separated)
          <input className={inp + flag("allerg")} value={f.allergies} onChange={e => set({ allergies: e.target.value })} /></label>

        <div>
          <div className="mb-1 text-sm font-medium">Medicines</div>
          {f.meds.map((m, i) => (
            <div key={i} className="mb-2 grid grid-cols-3 gap-2">
              {(["name", "dose", "frequency"] as const).map(k => (
                <input key={k} placeholder={k} className={inp + (k === "dose" ? flag("dose", "med") : flag("med"))}
                  value={m[k] as string}
                  onChange={e => set({ meds: f.meds.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)) })} />
              ))}
            </div>
          ))}
          <button className="text-sm text-blue-600"
            onClick={() => set({ meds: [...f.meds, { name: "", generic: null, dose: "", frequency: "" }] })}>+ add medicine</button>
        </div>

        <div>
          <div className="mb-1 text-sm font-medium">Lab results</div>
          {f.labs.map((l, i) => (
            <div key={i} className="mb-2 grid grid-cols-3 gap-2">
              {(["name", "value", "unit"] as const).map(k => (
                <input key={k} placeholder={k} className={inp + flag("lab")} value={l[k]}
                  onChange={e => set({ labs: f.labs.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)) })} />
              ))}
            </div>
          ))}
          <button className="text-sm text-blue-600"
            onClick={() => set({ labs: [...f.labs, { name: "", value: "", unit: "" }] })}>+ add lab result</button>
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}
        <button onClick={save} className="rounded bg-blue-600 px-5 py-2 font-semibold text-white">Confirm and save</button>
      </section>
    </main>
  );
}