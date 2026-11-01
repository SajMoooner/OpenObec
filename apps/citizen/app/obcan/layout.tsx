import { publicLinks } from "@openobec/api-client/server";
import { CitizenShell } from "@openobec/ui/features/shell";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <CitizenShell marketingUrl={publicLinks().marketing}>{children}</CitizenShell>;
}
