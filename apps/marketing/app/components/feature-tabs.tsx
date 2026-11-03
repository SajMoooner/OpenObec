"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@openobec/ui/components/tabs";
import { ProductDetail } from "./product-detail";
const stages = [
  {
    id: "priprava",
    title: "Príprava dokumentu",
    text: "Vyplňte údaje a uložte koncept. K rozpracovanému dokumentu sa môžete vrátiť, keď máte všetko pripravené.",
    image: "preparation",
    alt: "Vyplnený formulár ukážkovej faktúry pred zverejnením.",
  },
  {
    id: "prilohy",
    title: "Prílohy a súvislosti",
    text: "PDF patrí priamo k dokumentu. Súvisiacu zmluvu alebo objednávku vyberiete zo záznamov, ktoré už evidujete.",
    image: "published",
    alt: "Detail faktúry s prílohou PDF a prepojenými záznamami.",
  },
  {
    id: "zverejnenie",
    title: "Zverejnenie",
    text: "Keď je dokument pripravený, zverejníte ho. Pracovný detail vám ukáže jeho stav aj uložené údaje.",
    image: "published",
    alt: "Zverejnená ukážková faktúra v pracovnom portáli.",
  },
  {
    id: "obcan",
    title: "Pohľad občana",
    text: "Občan nájde zverejnený dokument, otvorí prílohu a prejde na súvisiace záznamy. Bez vstupu do pracovného portálu.",
    image: "citizen",
    alt: "Tá istá ukážková faktúra dostupná v občianskom portáli.",
  },
];
export function FeatureTabs() {
  return (
    <Tabs defaultValue="priprava" orientation="vertical" className="feature-tabs">
      <div className="tab-images">
        {stages.map((stage) => (
          <TabsContent value={stage.id} key={stage.id}>
            <ProductDetail
              alt={stage.alt}
              detail={
                stage.id === "priprava"
                  ? "preparation"
                  : stage.id === "prilohy"
                    ? "attachment"
                    : stage.id === "zverejnenie"
                      ? "published"
                      : "citizen"
              }
            />
            <p className="image-caption">Ilustrácia postupu · funkčný portál nájdete v deme</p>
          </TabsContent>
        ))}
      </div>
      <TabsList aria-label="Postup zverejnenia" variant="line">
        {stages.map((stage) => (
          <TabsTrigger value={stage.id} key={stage.id}>
            <span>{stage.title}</span>
            <span className="tab-description">{stage.text}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
