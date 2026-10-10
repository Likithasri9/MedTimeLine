import { sql } from "@/lib/db";
import RecordsTable, { type Row } from "./recordstable";

export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = {
  prescription: "Prescription",
  lab_report: "Lab Results",
  discharge_summary: "Discharge Summary",
  other: "Other",
};

export default async function Records() {
  const docs = await sql`
    select id, doc_type, provider, extracted, confirmed,
           to_char(doc_date, 'YYYY-MM-DD') as date_str,
           (file_b64 is not null) as has_file
    from documents order by doc_date desc nulls last, id desc`;

  const rows: Row[] = docs.map((d: any) => {
    const x = d.extracted ?? {};
    const parts = [
      ...(x.meds ?? []).map((m: any) => `${m.name} ${m.dose ?? ""}`.trim()),
      ...(x.labs ?? []).map((l: any) => l.name),
      ...(x.diagnoses ?? []),
    ];
    return {
      id: d.id,
      date: d.date_str ?? "—",
      type: LABEL[d.doc_type] ?? "Other",
      description: parts.slice(0, 3).join(", ") || "Could not read, please review",
      doctor: d.provider ?? "—",
      status: d.confirmed ? "Confirmed" : "Needs review",
      hasFile: d.has_file,
    };
  });

  return <RecordsTable rows={rows} />;
}