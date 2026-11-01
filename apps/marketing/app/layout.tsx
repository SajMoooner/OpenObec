import type { Metadata } from "next";
import "@openobec/ui/styles.css";
import { TooltipProvider } from "@openobec/ui/components/tooltip";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { default: "OpenObec · Žilina", template: "%s · OpenObec" },
  description:
    "Lokálne demo prehľadného zverejňovania dokumentov samosprávy. Ukážkové dáta mesta Žilina.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
