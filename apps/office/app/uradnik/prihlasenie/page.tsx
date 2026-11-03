import { publicLinks } from "@openobec/api-client/server";
import { redirect } from "next/navigation";
export default function Login() {
  redirect(`${publicLinks().marketing}/demo`);
}
