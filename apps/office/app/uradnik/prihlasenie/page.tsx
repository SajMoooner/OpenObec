import { publicLinks } from "@openobec/api-client/server";
import { OfficeLogin } from "@openobec/ui/features/login";
export default function Login() {
  return <OfficeLogin marketingUrl={publicLinks().marketing} />;
}
