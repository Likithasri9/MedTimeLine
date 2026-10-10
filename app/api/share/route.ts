// app/api/share/route.ts
import { sql } from "@/lib/db";
import { newToken, hashToken } from "@/lib/tokens";
import QRCode from "qrcode";

export async function POST(req: Request) {
  const { scope, doctorLabel, hours = 24 } = await req.json(); // scope: {all:true} | {condition:"diabetes"}
  const token = newToken();
  const expires = new Date(Date.now() + hours * 3600_000);
  await sql`insert into shares (token_hash, scope, doctor_label, expires_at)
            values (${hashToken(token)}, ${JSON.stringify(scope)}, ${doctorLabel}, ${expires})`;
  const url = `${process.env.APP_URL}/s/${token}`;
  return Response.json({ url, qr: await QRCode.toDataURL(url), expires });
}