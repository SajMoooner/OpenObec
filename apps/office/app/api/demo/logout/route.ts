import { cookies } from "next/headers";
export async function POST() {
  (await cookies()).delete("openobec-demo");
  return Response.json({ ok: true });
}
