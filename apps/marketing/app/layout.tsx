import type { Metadata } from "next";
import localFont from "next/font/local";
import "@openobec/ui/styles.css";
import "./marketing.css";
import { publicLinks } from "@openobec/api-client/server";
import { MarketingHeader, MarketingFooter } from "./components/site-shell";
const inter = localFont({
  src: "../public/fonts/InterVariable.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { default: "OpenObec · Dokumenty obce na jednom mieste", template: "%s · OpenObec" },
  description:
    "Pripravte dokument, priložte PDF a zverejnite ho pre občanov. Otvorený nástroj pre každodenné agendy samosprávy.",
};
const themeScript = `(function(){try{var d=localStorage.getItem('openobec-marketing-theme')==='dark';document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.classList.toggle('dark',d)}catch(e){}})()`;
export default function Layout({ children }: { children: React.ReactNode }) {
  const links = publicLinks();
  return (
    <html lang="sk" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#obsah">
          Preskočiť na obsah
        </a>
        <MarketingHeader />
        {children}
        <MarketingFooter officeUrl="/demo#uradnik" citizenUrl={`${links.citizen}/obcan/home`} />
      </body>
    </html>
  );
}
