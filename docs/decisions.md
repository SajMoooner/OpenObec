# Realizačné rozhodnutia

Tieto rozhodnutia dopĺňajú schválený návrh a sú zaznamenané v poradí prijatia. Používateľom potvrdené zdieľanie čítacej databázy a shadcn/ui s výhradne farbami IDSK3 sú priamo súčasťou zadania.

| Rozhodnutie | Dôvod | Dôsledok pri neskoršej zmene |
|---|---|---|
| Ponechať existujúci pracovný priečinok na vetve `codex/openobec-demo`. | Prostredie uprednostňuje existujúci checkout; používateľské výskumné podklady zostávajú nedotknuté. | Práca zdieľa tento priečinok; prípadné oddelenie vyžaduje samostatný checkout. |
| Vykonať schválený plán bez ďalšieho kola schvaľovania. | Používateľ výslovne schválil návrh a požiadal o implementáciu. | Revidované realizačné voľby možno upraviť v tejto vetve. |
| Prvú čítaciu generáciu vytvoriť z autoritatívnych HTTP exportov so zachytenými koncovými Kafka offsetmi pred seedom. | Historické skúšobné udalosti sa nemajú vydávať za aktuálne zdrojové záznamy; história zostáva zachovaná. | Úplnosť projekcie závisí od exportu a prehratia udalostí; overujú ju živé skúšky obnovy a verzií. |
| V spoločnom Compose stacku používať pevné názvy Kafka topicov, DLQ a konzumentskej skupiny. | Kontrakt určuje jeden tok a samovoľná nová skupina by prehrala historické udalosti bez riadnej obnovy. | Vlastné názvy vyžadujú vedomú úpravu orchestrace; samostatné služby ponechávajú možnosti pre izolované testy. |

Následná výslovná požiadavka používateľa na užšiu stredovú stránku a viac marketingových informácií nahradila pôvodné súradnice obrazového návrhu. Novú verziu schválila samostatná vizuálna kontrola. Staré meranie zostáva otvorené na63% a jeho neúspešný výsledok sa zachoval; nejde o tvrdenie o úspešnom pixelovom porovnaní. Ak by používateľ chcel obnoviť presné pôvodné súradnice, išlo by o ďalšiu úpravu.

Reálne autentifikačné riešenie, integrácia mestského IS, externé registre a inteligentné vyhľadávanie zostávajú mimo schváleného dema. Vetva sa automaticky nepublikuje ani nezlučuje.
