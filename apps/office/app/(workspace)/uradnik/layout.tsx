import { publicLinks } from "@openobec/api-client/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OfficeShell } from "@openobec/ui/features/shell";
export default async function Layout({ children }: { children: React.ReactNode }) {
  if (!(await cookies()).get("openobec-demo")) redirect("/uradnik/prihlasenie");
  return <OfficeShell citizenUrl={publicLinks().citizen}>{children}</OfficeShell>;
}
