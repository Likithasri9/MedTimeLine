import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

const docs = [
  { hash: "seed-1", file: "prescription_nov2025.pdf", type: "prescription", date: "2025-11-12", provider: "Dr. Meera Iyer, City Clinic",
    x: { diagnoses: ["Hypertension", "Type 2 diabetes"], allergies: [],
         meds: [{ name: "Telma", generic: "telmisartan", dose: "40 mg", frequency: "once daily" },
                { name: "Metformin", generic: "metformin", dose: "500 mg", frequency: "twice daily" }], labs: [] } },
  { hash: "seed-2", file: "lab_feb2026.pdf", type: "lab_report", date: "2026-02-03", provider: "Sunrise Diagnostics",
    x: { diagnoses: [], allergies: [], meds: [],
         labs: [{ name: "HbA1c", value: 8.1, unit: "%" }, { name: "Fasting glucose", value: 162, unit: "mg/dL" }] } },
  { hash: "seed-3", file: "prescription_jul2026.pdf", type: "prescription", date: "2026-07-20", provider: "Dr. Arun Rao, Lakeside Medical Centre",
    x: { diagnoses: ["Hypertension"], allergies: [],
         meds: [{ name: "Losartan", generic: "losartan", dose: "50 mg", frequency: "once daily" },
                { name: "Glimepiride", generic: "glimepiride", dose: "1 mg", frequency: "once daily" }], labs: [] } },
  { hash: "seed-4", file: "discharge_sep2026.pdf", type: "discharge_summary", date: "2026-09-12", provider: "St. Mary's Hospital",
    x: { diagnoses: ["Type 2 diabetes", "Hypertension"], allergies: ["Penicillin (rash)"],
         meds: [{ name: "Metformin", generic: "metformin", dose: "500 mg", frequency: "twice daily" }],
         labs: [{ name: "HbA1c", value: 7.4, unit: "%" }] } },
];

async function main() {
  await sql`delete from documents where file_hash like 'seed-%'`;
  for (const d of docs) {
    const x = { doc_type: d.type, date: d.date, provider: d.provider, low_confidence_fields: [], ...d.x };
    await sql`insert into documents (file_hash, filename, mime, doc_type, doc_date, provider, extracted, confirmed)
              values (${d.hash}, ${d.file}, 'application/pdf', ${d.type}, ${d.date}, ${d.provider}, ${JSON.stringify(x)}, true)`;
  }
  console.log("seeded", docs.length);
}
main();