// app/api/extract/route.ts
import Anthropic from "@anthropic-ai/sdk";
import crypto from "crypto";
import { sql } from "@/lib/db";
import { Extracted } from "@/lib/schema";

export const maxDuration = 60;
const client = new Anthropic();
const MAX = 5 * 1024 * 1024;
const OK = ["application/pdf", "image/png", "image/jpeg"];

const PROMPT = `Extract this medical document into JSON only, no prose, no code fences.
Keys: doc_type, date (YYYY-MM-DD or null), provider, diagnoses[], allergies[],
meds[{name, generic, dose, frequency}], labs[{name, value(number), unit}],
low_confidence_fields[] (names of any field you were unsure about, e.g. illegible handwriting).
Never guess. Use null or an empty array when something is absent.`;

async function run(b64: string, mime: string, retry = true): Promise<Extracted> {
  const block: any = mime === "application/pdf"
    ? { type: "document", source: { type: "base64", media_type: mime, data: b64 } }
    : { type: "image", source: { type: "base64", media_type: mime, data: b64 } };
  const res = await client.messages.create({
    model: process.env.EXTRACT_MODEL || "claude-sonnet-5-5",
    max_tokens: 2000,
    messages: [{ role: "user", content: [block, { type: "text", text: PROMPT }] }],
  });
  const text = res.content.map((c: any) => c.text ?? "").join("").replace(/```json|```/g, "").trim();
  try { return Extracted.parse(JSON.parse(text)); }
  catch (e) { if (retry) return run(b64, mime, false); throw e; }
}

export async function POST(req: Request) {
  const file = (await req.formData()).get("file") as File | null;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });
  if (!OK.includes(file.type)) return Response.json({ error: "Unsupported type" }, { status: 415 });
  if (file.size > MAX) return Response.json({ error: "File over 5 MB" }, { status: 413 });

  const buf = Buffer.from(await file.arrayBuffer());
  const hash = crypto.createHash("sha256").update(buf).digest("hex");
  const dup = await sql`select id from documents where file_hash=${hash}`;
  if (dup.length) return Response.json({ error: "Already uploaded", id: dup[0].id }, { status: 409 });

  let extracted: Extracted | null = null;
  try { extracted = await run(buf.toString("base64"), file.type); } catch {}

  const [row] = await sql`
    insert into documents (file_hash, filename, file_b64, mime, doc_type, doc_date, provider, extracted)
    values (${hash}, ${file.name}, ${buf.toString("base64")}, ${file.type},
            ${extracted?.doc_type ?? "other"}, ${extracted?.date ?? null},
            ${extracted?.provider ?? null}, ${extracted ? JSON.stringify(extracted) : null})
    returning id`;
  return Response.json({ id: row.id, extracted, needsManualEntry: !extracted });
}