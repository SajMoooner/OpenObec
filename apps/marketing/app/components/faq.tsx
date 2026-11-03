"use client";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@openobec/ui/components/accordion";
const questions = [
  [
    "Čo si môžem v deme vyskúšať?",
    "V pracovnom portáli vytvoríte dokument, priložíte PDF, vyberiete súvisiace záznamy a dokument zverejníte. V občianskom portáli potom overíte jeho verejný detail. Demo pracuje s fiktívnymi údajmi pre Žilinu.",
  ],
  [
    "Môžem si dokument najskôr uložiť ako koncept?",
    "Áno. Rozpracovaný dokument môžete uložiť ako koncept a neskôr upraviť. Občanom je dostupný až po zverejnení.",
  ],
  [
    "Je OpenObec bezplatný?",
    "Zdrojový kód je otvorený a vlastné prevádzkovanie je bez licenčného poplatku. Náklady na infraštruktúru a správu si zabezpečujete sami. Spravovaná služba za 199 € ročne je zatiaľ obchodný zámer, nie dostupné predplatné.",
  ],
  [
    "Je OpenObec prepojený s informačným systémom obce?",
    "Prepojenie s mestskými informačnými systémami je plánované. Aktuálne demo funguje samostatne a reálnu integráciu s mestským IS neobsahuje.",
  ],
  [
    "Nahrádza zverejnenie v povinných externých registroch?",
    "Demo ukazuje zverejnenie vo vlastnom občianskom portáli. Neodosiela dokumenty do externých registrov a nie je potvrdením splnenia zákonných povinností obce.",
  ],
];
export function Faq() {
  return (
    <section className="section m-container faq-section" id="otazky">
      <div className="section-heading">
        <h2>Odpovede pred prvým kliknutím</h2>
        <p>Čo dnes OpenObec dokáže a čo ešte pripravujeme.</p>
      </div>
      <Accordion type="single" collapsible className="faq-list">
        {questions.map(([question, answer], index) => (
          <AccordionItem key={question} value={`q-${index}`}>
            <AccordionTrigger>{question}</AccordionTrigger>
            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
