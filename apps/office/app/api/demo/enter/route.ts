import { cookies } from "next/headers";

// Explicit form submission starts the same local demo session as POST /api/demo.
// A relative redirect keeps the browser on the configured public office origin.
export async function POST() {
  (await cookies()).set("openobec-demo", "zilina", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 86400,
  });
  return new Response(null, {
    status: 303,
    headers: { Location: "/uradnik/home", "Cache-Control": "no-store" },
  });
}
