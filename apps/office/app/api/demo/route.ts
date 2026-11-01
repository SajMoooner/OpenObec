import { cookies } from "next/headers";
export async function POST() {
  (await cookies()).set("openobec-demo", "zilina", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 86400,
  });
  return Response.json({ ok: true });
}
