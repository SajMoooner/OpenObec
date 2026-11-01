import { proxyApi } from "@openobec/api-client/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handle(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyApi(request, path, true);
}
export const GET = handle;
export const POST = handle;
