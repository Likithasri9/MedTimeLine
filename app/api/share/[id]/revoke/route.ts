import { sql } from "@/lib/db";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`update shares set revoked = true where id = ${Number(id)}`;
  return Response.json({ ok: true });
}