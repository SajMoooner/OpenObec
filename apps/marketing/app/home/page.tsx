import { publicLinks } from "@openobec/api-client/server";
import { MarketingHero } from "./hero";
import { HomeSections } from "./sections";
import { MarketingFooter } from "../components/site-shell";
import "./marketing.css";
export const dynamic = "force-dynamic";
export default function MarketingHome() {
  const links = publicLinks();
  return (
    <>
      <main>
        <MarketingHero citizen={links.citizen} office={links.office} />
        <HomeSections />
      </main>
      <MarketingFooter />
    </>
  );
}
