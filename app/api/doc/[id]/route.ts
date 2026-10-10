// app/api/doc/[id]/route.ts
import { sql } from "@/lib/db";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [d] = await sql`select file_b64, mime from documents where id = ${Number(id)}`;
  if (!d?.file_b64) return new Response("No file", { status: 404 });
  return new Response(Buffer.from(d.file_b64, "base64"), { headers: { "Content-Type": d.mime } });
}
