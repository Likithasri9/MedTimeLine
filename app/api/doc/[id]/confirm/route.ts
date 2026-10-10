import { sql } from "@/lib/db";
import { Extracted } from "@/lib/schema";
import { generic } from "@/lib/meds";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = Extracted.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Invalid data" }, { status: 400 });
  const x = parsed.data;
  if (!x.date || !/^\d{4}-\d{2}-\d{2}$/.test(x.date))
    return Response.json({ error: "Date is required (YYYY-MM-DD)" }, { status: 400 });

  x.meds = x.meds.map(m => ({ ...m, generic: m.generic ?? generic(m.name) }));
  await sql`update documents set doc_type = ${x.doc_type}, doc_date = ${x.date}, provider = ${x.provider},
            extracted = ${JSON.stringify(x)}, confirmed = true where id = ${Number(id)}`;
  return Response.json({ ok: true });
}