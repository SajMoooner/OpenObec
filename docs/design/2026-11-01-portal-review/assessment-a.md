# Assessment A — nezávislé posúdenie aktuálnych portálov OpenObec

Autor: `/root/portal_design_review`. Dátum: 1. 11. 2026. Toto je izolované dizajnové posúdenie A pre následnú syntézu s posúdením B. Bez čítania výstupov detektora, predchádzajúcich kritík alebo zistení druhého posudzovateľa. Bez úprav produktu.

## Rozsah a istota zistení

Prečítané: `PRODUCT.md`, `DESIGN.md`, marketingový brief a brief pracovných portálov, novší marketingový refinement, všetky tri `apps/*/AGENTS.md`, všetky routové obaly, definície šiestich agend a spoločné komponenty pre navigáciu, vyhľadávanie, tabuľky, detail, tvorbu/úpravu, súvislosti, prílohy, dashboard, vstup a nastavenia. Staršiu absolútnu geometriu marketingového briefu nepovažujem za aktuálnu: dnešný marketing má stredový kontajner 1280 px a rozšírený obsah.

Vlastné nové karty v živom prehliadači: marketing `/home`, `/vyhody`, `/kontakt`, `/demo`; občan `/obcan/home`, zoznam zmlúv, dva detaily zmlúv, textové vyhľadávanie a návrat z detailu; úradník prihlásenie, dashboard, detail zmluvy a úprava existujúcej zmluvy so štyrmi väzbami. Zvolený iba povolený vstup do dema; žiadny záznam nebol uložený, publikovaný alebo vymazaný. Existujúce aktuálne snímky v `.impeccable/review` dopĺňajú mobilné posúdenie marketingu, občianskeho home/list/detail a úradníckeho editora, nového obstarávania a nastavení. Veľkosť spoločného prehliadača som nemenil.

Všetky route families sú pokryté zdrojovou analýzou; netvrdím, že každá kombinácia agendy a stránky bola samostatne preklikaná. Nevykonané: test so skutočnou čítačkou obrazovky, úplný audit kontrastu, záťažový test ani zápisové end-to-end scenáre. Skóre stavov vychádza pri nevyvolaných chybách zo zdrojov.

## Verdikt o osobitosti návrhu

OpenObec už pôsobí ako súdržný produkt. Navy úvod s občianskou panorámou, šesť miestnych agend, slovenčina a explicitné súvislosti vytvárajú dostatočný vlastný kontext. Konvenčné shadcn ovládanie je tu správna voľba, nie nedostatok originality. Geist, obmedzená paleta a ploché pracovné plochy treba zachovať.

Najväčšia slabina nie je vzhľad tlačidiel. Dnešná informačná hierarchia je stále blízka všeobecnej evidencii: rovnaký riadok a rovnaké pole údajov pre faktúru, obstarávanie aj VZN. Keď sa zmení agenda, používateľ často nedostane vo výsledkoch tie informácie, podľa ktorých sa rozhoduje. Profesionálnejší dojem prinesie predovšetkým presnosť významu, plynulý návrat k rozpracovanej úlohe a pokojnejšie dokončenie publikovania.

Marketing je vizuálne najautorskejší. Pracovné portály sú zámerne štandardné, ale mali by byť presnejšie prispôsobené dokumentom. Súvislosti majú potenciál byť charakteristickou funkciou produktu; ich súčasná editácia s identifikátormi namiesto názvov tento potenciál znižuje.

## Nielsenove heuristiky

Stupnica 0–4, vyššie je lepšie. Skóre je odborné posúdenie, nie výsledok používateľského testu. Marketing je Persuade, ostatné portály Operate.

| # | Heuristika | Marketing | Občan | Úradník |
|---|---|---:|---:|---:|
| 1 | Viditeľný stav systému | 3 | 3 | 3 |
| 2 | Jazyk a význam blízky reálnemu svetu | 3 | 2 | 3 |
| 3 | Kontrola a sloboda používateľa | 3 | 2 | 2 |
| 4 | Konzistentnosť a štandardy | 3 | 3 | 3 |
| 5 | Predchádzanie chybám | 3 | 3 | 2 |
| 6 | Rozpoznanie namiesto zapamätávania | 3 | 2 | 2 |
| 7 | Flexibilita a efektívnosť | n/a | 2 | 2 |
| 8 | Estetika a minimalizmus | 3 | 3 | 3 |
| 9 | Rozpoznanie chyby a náprava | 3 | 3 | 3 |
| 10 | Pomoc a dokumentácia | 2 | 1 | 2 |
| **Spolu** | | **26/36, 72 % — dobrý základ** | **24/40, 60 % — významné zlepšenia** | **25/40, 63 % — významné zlepšenia** |

Marketing H7: klávesové skratky a pracovné akcelerátory nie sú relevantným cieľom presviedčacej stránky. H10 zostáva hodnotená, pretože vysvetlenie dema, rozsahu a ceny má rozhodovaciu úlohu.

- **Marketing:** jasné dva demovstupy, konzistentné komponenty a pravdivé vymedzenie rozsahu. Slabšie je rozlíšenie účelu jednotlivých stránok, technickejšie formulácie ako „explicitne vybrané súvislosti“ a kontaktná cesta bez kontaktu. Základné FAQ existuje; nejde o kontextovú pomoc v produkte.
- **Občan:** načítanie, chyba a prázdny výsledok majú zrozumiteľné stavy. Význam „Dátum“ a „Naposledy zverejnené“ nie je presný voči použitým dátam. Výsledky a návrat si vyžadujú opakovať hľadanie. Navigácia nemá označenú aktívnu agendu. Chýba krátka pomoc pre občana pri VZN a rozdiele medzi dvoma fakturačnými agendami.
- **Úradník:** koncept/publikácia sú pomenované textom, formulár má chybový súhrn a chyby polí, vymazanie vyžaduje potvrdenie, čiastočne uložený záznam sa pri chybe nahrávania zachová. Slabé miesta sú odchod z rozpracovaného formulára, názvy existujúcich väzieb, dôsledok úpravy už publikovaného záznamu a návrat k rozpracovanému zoznamu. Neprítomnosť dávkových operácií beriem ako priestor budúceho rozvoja, nie porušenie potvrdeného rozsahu.

## Čo funguje

1. **Spoločný vizuálny systém je primeraný samospráve.** Standard shadcn Button/Input/Select/Sheet/Sidebar/Accordion/Table, Geist a obmedzená modrá paleta vytvárajú čitateľný, dôveryhodný základ. Nie je dôvod nahrádzať ho vlastnou sadou ovládacích prvkov alebo dekoratívnym dashboardom.
2. **Demo je poctivo vysvetlené.** Vstup bez hesla, ukážkové dáta, neurčené cenové podmienky a simulácia IS sú označené. Neobjavuje sa vymyslená zákaznícka referencia ani prísľub reálneho pripojenia.
3. **Základné stavy sú kvalitnejšie než samotná prezentácia údajov.** Skeleton má stavovú rolu, chyby ponúkajú opakovanie, formulárové chyby odkazujú na polia, zmazanie je potvrdené, stav „Koncept/Zverejnené“ nie je vyjadrený iba farbou. Mobilný zoznam zalamuje názvy namiesto ich orezania.

## Päť priorít

### 1. P1 — Zoznamy neukazujú význam údajov podľa agendy

**Dôkaz:** `packages/ui/src/features/shared.tsx:137` má spoločné hlavičky „Dátum“ a „Suma“. Na riadku 171 sa vždy vykresľuje `created_at`; na riadku 174 sa v rovnakom stĺpci kombinuje suma s DPH s predpokladanou hodnotou obstarávania bez DPH. `citizen.tsx:59` triedi domov podľa vytvorenia, ale nadpis na riadku 93 hovorí „Naposledy zverejnené“. Dashboard triedi podľa úprav (`dashboard.tsx:45`), ale tabuľka opäť ukazuje dátum vytvorenia. VZN má prázdnu sumu. Pod `lg` dátum z riadka úplne mizne (`shared.tsx:156–174`).

**Dopad:** občan nevie, či číta dátum zmluvy, publikovania alebo vloženia do evidencie. Pri obstarávaní nevidí stav ani lehotu; pri VZN účinnosť. Na mobile musí otvárať detaily kvôli údajom, ktoré na desktope aspoň čiastočne vidí. Rovnaká vizuálna úprava zastiera rozdielny finančný význam.

**Návrh v dnešnom rozsahu:** zachovať jeden štandardný shadcn Table, ale definovať stĺpce a mobilné metadáta podľa agendy. Pomenovať presný dátum a typ sumy. Na občianskom home buď použiť skutočný údaj publikovania, ak sa doplní do modelu, alebo pravdivo premenovať sekciu na najnovšie záznamy. Na dashboarde ukázať dátum úpravy. Minimálne 1 relevantný dátum musí zostať aj v mobilnom riadku. Pri VZN odstrániť sumu; nahradiť ju účinnosťou. Podrobnosti v tabuľke nemusia byť početné: titul/číslo + 2–3 rozhodujúce metadáta.

Prípadné nové filtrovanie podľa roku, partnera, lehoty a doménového stavu označiť za funkčné rozšírenie, ktoré vyžaduje overenie podpory API. Nevykresliť nefunkčné filtre. Vhodný zásah: `$impeccable clarify`, `$impeccable layout`.

### 2. P1 — Pri prechode medzi obrazovkami sa stráca pracovný kontext

**Dôkaz A — overené naživo:** v občianskych zmluvách hľadanie „stromov“ vrátilo 2 výsledky. Otvorenie výsledku a odkaz „Zmluvy“ v detaile vrátili prázdne vyhľadávanie a všetkých 8 dokumentov. `list.tsx:32–37` ukladá query, stranu a triedenie iba do lokálneho stavu, `detail.tsx:193` odkazuje na holý zoznam. Rovnaký list/detail používajú všetky agendy a oba portály.

**Dôkaz B — overené naživo:** úprava zmluvy `DEMO-2026-03-001` ukázala štyri existujúce súvislosti ako `fak_…`, `dfak_…`, `obj_…`, `vo_…`. `reference-picker.tsx:52` začína s prázdnym slovníkom názvov a riadok 201 spadne na interné ID. Používateľ môže odstrániť vzťah, ale bez návratu do detailu nevidí, ktorý konkrétny dokument odstraňuje.

**Dopad:** porovnávanie viacerých dokumentov vyžaduje opakovať hľadanie; editácia väzieb vyžaduje pamätať si identifikátory. Oba problémy poškodzujú hlavnú hodnotu produktu — súvislú prácu s dokumentmi.

**Návrh:** query, triedenie, stav a stranu zapisovať do adresy a zachovať návratový kontext. Odkaz z detailu pomenovať „Späť na výsledky“, ak používateľ prišiel z hľadania. Existujúce väzby načítať s ľudským číslom a názvom, agendu a publikáciu ukázať sekundárne; interné ID ponechať iba v metadátach. Chybu načítania názvu rozlíšiť od neexistujúceho dokumentu. Vhodný zásah: `$impeccable harden`, `$impeccable clarify`.

### 3. P1 — Editor potrebuje jasnejšie chrániť rozpracovanú a publikovanú prácu

**Dôkaz zo zdroja:** `editor.tsx:46` drží hodnoty iba v pamäti komponentu; formulár nemá signalizáciu neuložených zmien ani ochranu odchodu. Odkaz „Existujúce prílohy spravovať v detaile dokumentu“ (`editor.tsx:305`) priamo opúšťa editor. Pri publikovanom zázname `editor.tsx:74` zachová publikovaný stav a tlačidlo znie iba „Uložiť zmeny“ (`editor.tsx:326`). V detaile hlavné tlačidlo po publikovaní prejde na „Stiahnuť zo zverejnenia“ (`detail.tsx:217`); neexistuje vedľa neho priamy náhľad konkrétneho dokumentu v občianskom portáli.

**Dopad:** úradník môže prejsť k prílohám alebo inej agende a stratiť zadávanie. Nie je dostatočne zrejmé, že uložené úpravy už publikovaného dokumentu ostávajú verejné. Po úspechu sa najsilnejšou akciou stáva zrušenie dosiahnutého výsledku.

**Návrh v dnešnom rozsahu:** v hlavičke editora názov/číslo + textový stav, sekcie „Identifikácia“, „Termíny a suma“, „Partner“, „Súvislosti“, „Prílohy“. Pri rozpracovaných zmenách jasný stav a potvrdenie opustenia; netreba povinne zavádzať autosave. Správu existujúcich príloh sprístupniť bez tichého opustenia neuložených údajov. Pri publikovanom zázname vysvetliť dosah uloženia vedľa akcie. Po uložení/publikácii zobraziť konkrétne potvrdenie a odkaz na verejný detail; „Stiahnuť zo zverejnenia“ presunúť medzi sekundárne akcie, stále priamo dostupné. Na mobile zvážiť prichytený spodný pás akcií tak, aby neprekrýval obsah ani klávesnicu.

Autosave, história zmien a obnova staršej verzie sú samostatné nové funkcie; nie sú dnes implementované ani potrebné na prvú úpravu rozhrania. Vhodný zásah: `$impeccable harden`, `$impeccable onboard`.

### 4. P2 — Detail dokumentu má slabú hierarchiu a odsúva hlavný súbor

**Dôkaz:** `detail.tsx:199–259` ukáže číslo a titul v hlavičke, potom ich opakuje medzi rovnocennými poľami v rozsiahlom paneli. `RecordFields` vykresľuje pole po poli v poradí konfigurácie (`detail.tsx:41`). Prílohy nasledujú až potom. Na aktuálnej 390 px snímke faktúry je sekcia príloh približne pod 980 px výšky. Súbor má metadata `application/pdf` (`attachments.tsx:94`) a na mobile iba ikonový download (`attachments.tsx:107`).

**Dopad:** občan hľadajúci znenie zmluvy alebo VZN najprv prescrolluje administratívne údaje. Významná suma, účinnosť, partner a deadline sú vizuálne rovnako dôležité ako opakované evidenčné číslo. Súvislosti sú užitočné, ale ich úplne rozbalené údaje môžu ďalej výrazne predĺžiť stránku.

**Návrh:** zachovať jednoduchý shadcn vzhľad, no detail začať titulom, číslom, stavom a stručným blokom 2–4 kľúčových údajov podľa agendy. Hneď pri hlavičke ponúknuť „Prílohy (n)“ alebo jasnú akciu na hlavný súbor. Na desktope môžu byť súbory a stručné údaje v užšom stĺpci; na mobile musia byť v prvom logickom úseku stránky. Názov typu „PDF · 0,6 kB“ je vhodnejší než MIME. Súvislosti ponechať v Accordion, s jasným číslom, názvom a druhom dokumentu. Nepotrebujú dekoratívny graf. Vhodný zásah: `$impeccable layout`, `$impeccable distill`.

### 5. P2 — Marketing opakuje prísľuby, ale nedokončuje rozhodovaciu cestu

**Dôkaz:** home má dva veľké prínosy a hneď ďalšie tri, ktoré opakujú prehľad, súvislosti a prílohy (`home/sections.tsx:61–130`). Stránka výhod pridáva tabuľku, kde všetkých šesť riadkov hovorí to isté (`vyhody/page.tsx:73–76`). Home, výhody, kontakt aj demo končia rovnakým `DemoLinks`. Kontakt explicitne uvádza, že adresa nie je nastavená (`kontakt/page.tsx:15`). To je pravdivé, ale položka v hlavnej navigácii sľubuje úkon, ktorý používateľ nemôže vykonať. Mobilný home má približne 6790 px; dĺžku tvoria najmä opakované textové prínosy a zoznamy.

**Dopad:** zástupca obce sa opakovane dozvedá, že evidencia je prehľadná, no vidí málo konkrétneho postupu a nevie nadviazať kontakt. „Výhody“ nepridávajú oproti home dostatočne novú informáciu. Marketing priorizuje občianske demo, hoci návštevník vyhodnocujúci produkt potrebuje pochopiť najmä prácu úradu a výsledok pre občana.

**Návrh:** home ponechať ako stručnú cestu problém → skutočná ukážka → výsledok pre občana/úradník → cena s vysvetlením → FAQ → demo. Jednu opakovanú sekciu nahradiť autentickou ukážkou aktuálneho produktu s jedným konkrétnym scenárom „zmluva → objednávka → faktúra“. Výhody urobiť hĺbkovou stránkou s odlišnými agendami a porovnaním pracovného postupu pred/po, bez nevykázaných úspor. Demo ponechať ako jasný výber dvoch rolí s krátkym odporúčaným scenárom. Pokiaľ kontakt nie je schválený, stránku aj navigáciu pravdivo premenovať na informácie o projekte; reálny formulár alebo email pridať až s určeným príjemcom. Cena 199 € ostáva obchodným návrhom, nie hotovou objednávkou. Vhodný zásah: `$impeccable distill`, `$impeccable clarify`.

## Návrh podľa všetkých rodín stránok

| Rodina | Úprava dnešného rozhrania | Čo by už bolo rozšírenie funkcií |
|---|---|---|
| Marketing home | Zachovať navy/panorámu, 1280 px obsah a hľadanie. Skrátiť opakovanie, ukázať skutočný postup v dvoch portáloch. Mobilnú ukážku zjednodušiť tak, aby akcia nebola až v horizontálne odsunutom poslednom stĺpci. | Nové referencie zákazníkov, integrácie, metriky úspor sa nesmú tvrdiť bez podkladov. |
| Marketing výhody | Prínosy rozvinúť do konkrétnych scenárov; šesť rovnakých riadkov nahradiť šiestimi významovo odlišnými popismi. | Nové schopnosti, ktoré by scenáre vyžadovali, musia byť označené ako plán. |
| Marketing kontakt | Pravdivý názov stránky, jasný ďalší krok. | Skutočný email, formulár, rezervácia stretnutia — potrebujú reálny cieľ a proces. |
| Marketing demo | Dva vyrovnané vstupy, čo sa dá v každom skúsiť, upozornenie na fiktívne dáta pri vstupe. | Samostatný interaktívny onboarding je voliteľné rozšírenie. |
| Občan home | Vyhľadávanie ako dominantná úloha, krátke vysvetlenie agend, pravdivý názov čerstvých záznamov. Výsledky s počtom a voľbou ďalšej agendy bez steny prázdnych sekcií. | Našepkávanie, obľúbené položky alebo upozornenia nie sú dnešnou funkciou. |
| Občan 6× zoznam | Aktívna agenda, pomocný opis, významové stĺpce, zachovanie query/strany, počet výsledkov bližšie k nástrojom, jasné zrušenie hľadania. | Nové doménové filtre až po overení podpory a rozsahu. |
| Občan 6× detail | Stručný prehľad podľa agendy, súbory skôr, presné dátumy, čitateľné súvislosti; VZN bez sekcie súvislostí. | PDF náhľad, pripomienky a právna interpretácia účinnosti nie sú aktuálne dostupné. |
| Úradník vstup | Zachovať jeden jednoduchý vstup bez hesla a pravdivé označenie dema; viac vizuálneho obsahu nie je nutné. | Reálne prihlásenie, roly a správa účtov mimo dema. |
| Úradník dashboard | „Posledné zmeny“ s dátumom úpravy; celkové počty znížiť na sekundárnu úroveň. Prehľad konceptov môže byť vhodnejší pracovný vstup, ak sa napojí na existujúci filter. | Úlohy, schvaľovanie, termínové upozornenia a auditný feed sú nové schopnosti. |
| Úradník 6× zoznam | Zdieľať dátové významy s občanom, pridať výrazný publikovaný/koncept stav a konkrétne „Pridať zmluvu/faktúru…“. Zachovať návratový kontext. | Dávkové publikovanie, import a export vyžadujú vlastný funkčný návrh. |
| Úradník 6× nový | Zmysluplné skupiny polí, krátke príklady, rozdiel koncept/publikovanie pri akciách, prehľad vybraných príloh; VZN bez väzieb. | Automatické číslovanie, CPV katalóg, dopĺňanie partnerov z registrov alebo výpočet DPH sú rozšírenia. |
| Úradník 6× úprava | Názov/číslo/stav v hlavičke, čitateľné väzby, ochrana pred stratou zmien, prístup k existujúcim prílohám v kontexte. | Autosave, verzovanie a obnova nie sú dnes prítomné. |
| Úradník 6× detail | Primárna akcia podľa stavu: pri koncepte zverejnenie, pri publikovanom zázname úprava/náhľad. Pri zmene stavu konkrétne potvrdenie. | Schvaľovací workflow nesugerovať ako existujúci. |
| Úradník nastavenia IS | Zachovať poctivé „Ukážka bez reálneho pripojenia“. Read-only hodnoty môžu byť opisný blok, nie dojem nastaviteľného formulára. V navigácii zvážiť názov „Ukážka pripojenia IS“. | Skutočné pripojenie, synchronizácia, logy a mapovanie polí až ako samostatný projekt. |
| Chyby, prázdne a načítavacie stavy | Zachovať skeleton/retry, prázdny výsledok odlíšiť od prázdnej evidencie; pri filtri stavu neponúkať „Pridať prvý dokument“, ak len žiadny nespĺňa filter. Po úspechu pomenovať konkrétnu akciu. | Automatická obnova a sofistikovaná offline práca nie sú dnes dostupné. |

## Šesť agend nemá mať šesť identických informačných hierarchií

Všetky návrhy stĺpcov nižšie používajú existujúce polia z `packages/api-client/src/agendas.ts`. Nové výpočty stavu platnosti treba označiť ako odvodenú informáciu a vopred odsúhlasiť ich pravidlá; nie automaticky ako právny verdikt.

| Agenda | Čo má občan rozpoznať v riadku/detaile | Čo má editor zoskupiť a vysvetliť |
|---|---|---|
| Faktúry | Výslovne vystavené/odberateľské faktúry; odberateľ, vystavenie alebo splatnosť, suma s DPH. | Identifikácia, odberateľ, dva dátumy, trojica súm. Nezamieňať odberateľa s dodávateľom. Výpočet DPH je nový pomocník, nie dnes existujúce správanie. |
| Dodávateľské faktúry | Prijaté faktúry; dodávateľ, vystavenie/splatnosť, suma s DPH. | Rovnaká finančná gramatika ako faktúry, iný účastník a jasný názov agendy. |
| Zmluvy | Zmluvná strana, dátum podpisu, účinnosť, prípadne platnosť do, suma s DPH. Hlavný súbor má vysokú prioritu. | Identifikácia + partner, termíny, suma, súvislosti a prílohy. Pri neuvedenej platnosti nepísať automaticky „na dobu neurčitú“, ak to údaj nedokladá. |
| Objednávky | Dodávateľ, dátum objednania, prípadný termín dodania, suma s DPH. | Predmet, partner, termíny, suma; nevytvárať nepodložený stav „dodané/zaplatené“. |
| Verejné obstarávanie | Názov, existujúci stav obstarávania, lehota ponúk s časom, predpokladaná hodnota **bez DPH**. | CPV s krátkym vysvetlením/formátovým príkladom, hodnota, lehota s jasným časovým pásmom a stav. Publikačný stav odlíšiť od stavu obstarávania. |
| VZN | Rozpísať skratku pri nadpise, číslo, názov, schválenie, účinnosť a voliteľná platnosť do. Bez sumy. | Identifikácia, dátumy a prílohy. Žiadny partner a žiadne párovanie — to zodpovedá implementácii. |

## Kognitívna záťaž a emocionálna cesta

Použitý checklist: jeden cieľ, porciovanie, zoskupenie, hierarchia, jedna vec naraz, obmedzené voľby, pamäť, postupné odhaľovanie. Prekročenie štyroch možností je signál na preverenie, nie mechanický dôvod skryť existujúce agendy.

- **Marketing: 2/8 zlyhania, mierna záťaž.** Slabší jednotný cieľ a množstvo súčasných ciest v úvode: dva demovstupy, hľadanie, sedem tabov a tri riadkové odkazy. Šesť agend je legitímna taxonómia, no preview a vstup do produktu sa navzájom prekrývajú. Emočne je úvod dôveryhodný; dolina vzniká, keď „Kontakt“ nedá kontakt a „Výhody“ zopakujú obsah. Koniec treba postaviť na konkrétnom odporúčanom scenári dema.
- **Občan: 3/8 zlyhania, mierna záťaž.** Voľba zo šiestich málo vysvetlených agend, pamäť pri návrate a slabé odhaľovanie relevantných výsledkov. Globálne hľadanie vypisuje každú agendu vrátane nulových zhôd (`citizen.tsx:111–133`), takže výsledková stránka môže vyzerať dlhá aj pri minimálnom úspechu. Začiatok je jednoduchý; dolina je zisťovanie, ktorý dátum alebo typ faktúry je správny; odmena je stiahnutie súboru, ktorú má detail sprístupniť skôr.
- **Úradník: 3/8 zlyhania, mierna až vyššia záťaž v editore.** Porciovanie základných údajov, pamäť pri väzbách a prílohách, slabá hierarchia po publikovaní. Pri faktúre je sedem polí v sekcii „Údaje dokumentu“ ešte pred partnerom; pri obstarávaní sedem vrátane CPV, času a stavu. Emocionálny začiatok bez hesla je ľahký. Najnižší bod je kontrola pred publikovaním a odchod k prílohám. Dobrý koniec musí potvrdiť výsledok a ukázať občiansky pohľad, nie dominantne ponúknuť zrušenie publikovania.

## Persony a konkrétne varovné signály

Použité archetypy z referencie: Jordan, Casey, Alex a Sam podľa portálu. AGENTS.md nemá Design Context, preto nevytváram nové vymyslené projektové persony; roly občana, úradníka a zástupcu samosprávy sú prevzaté z PRODUCT.md.

- **Jordan, prvý návštevník marketingu:** dva vstupy sú pochopiteľné, ale stále chýba odporúčaný krátky scenár pre zástupcu obce. „Kontakt“ končí bez kontaktu. Porovnávanie šiestich riadkov na výhodách neposkytne rozdiely.
- **Jordan, občan:** „Faktúry“ oproti „Dodávateľské faktúry“ a skratka „VZN“ predpokladajú znalosť evidencie. Na konkrétnych stránkach má byť jednovetový opis a vysvetlenie relevantného dátumu.
- **Casey, občan na mobile:** názvy sa dobre zalamujú, no dátum v riadku zmizne a download je až po dlhej množine údajov. Marketing má dve nezávislé horizontálne plochy — taby a preview tabuľku — a samotný riadkový odkaz je na konci širokej tabuľky.
- **Alex, úradník:** zachované filtre a čitateľné väzby prinesú väčší efekt než ďalšie dashboardové grafy. Existujúce UUID vyžadujú opustiť editor alebo si pamätať detail. Hromadné operácie by boli užitočné neskôr, ale nie sú podmienkou opravy dnešného toku.
- **Sam, úradník/občan s klávesnicou alebo čítačkou:** pozitívom sú skip linky, skutočné shadcn ovládanie, textové stavy a chybový súhrn s odkazmi. Treba doplniť aktívnu občiansku agendu, zrozumiteľné pomenovanie výsledku akcie a overiť živé oznámenie nového počtu výsledkov. `SearchBox` podporuje busy stav, ale list/home mu ho neposielajú. Tabuľkové odkazy na titul a následnú šípku duplikujú každý cieľ v poradí klávesnice. Toto nie je tvrdenie o zlyhaní celej prístupnosti; úplný asistívny test nebol vykonaný.

## Menšie pozorovania a mobilné detaily

- Predvolené shadcn tlačidlá majú 36 px a malé 32 px (`components/button.tsx:21–28`); mobilný search už má 44 px. Menu, download a stránkovanie treba cielene upraviť na pohodlnejšiu dotykovú plochu, bez zavedenia nového komponentového štýlu.
- Občianska navigácia (`shell.tsx:100`) nemá aktívny stav; úradnícka ho správne má. Na mobile občiansky Sheet neobsahuje pomocný kontext ukážkového prostredia, ktorý je na desktope v hlavičke.
- Marketingová panoráma je primeraná dekorácia. Jej opakovanie vo formulároch alebo pridanie gradientov, metrík či ilustrácií do každej agendy by nezlepšilo pracovnú skúsenosť.
- Demo dáta s opakovanými „syntetický záznam“ titulmi sú pravdivo označené, ale slabo predvádzajú rozdiely medzi agendami. Pripraviť niekoľko uveriteľných, stále jasne fiktívnych ukážkových prípadov vrátane dlhého názvu, dokumentu bez prílohy a prepojeného reťazca. Bez skutočných osobných údajov a bez predstierania referencie mesta.
- Opravovať aj drobný jazyk: „2 výsledkov“, „1 dokumentov“, technické „explicitne“ a MIME. Nejde o hlavný redesign, ale o dôslednosť produktu.
- `Failure` má univerzálny nadpis „Údaje sa nepodarilo načítať“ aj pri chybe nahrávania alebo publikovania. Rozlíšiť čítanie, uloženie a nahratie (`shared.tsx:42`, `attachments.tsx:151`, `detail.tsx:233`).
- Nevytvárať prázdny cenový konfigurátor, nefunkčné filtre, zvončeky, používateľské menu, export ani „AI hľadanie“ iba preto, že ich má inšpiračná šablóna.

## Otázky pre syntézu s používateľom

1. Ktorú z preukázaných bariér riešiť ako prvú: **presnosť zoznamov a detailov**, **plynulé vyhľadávanie/úpravy**, alebo **marketingovú cestu k demu**?
2. Má ďalší krok zostať pri **úprave existujúcich funkcií** (odporúčané), alebo pripraviť aj samostatný návrh **nových filtrov a pracovných pomocníkov**?
3. Pri marketingu má byť primárnym scenárom **zástupca obce skúšajúci prácu úradu**, alebo majú byť **obidve democesty rovnocenné**? Dnešné hlavné farebné tlačidlo zvýrazňuje občana.

Záver posúdenia A: zachovať skutočné shadcn/ui, Geist a IDSK3 farby. Profesionalitu budovať cez zmysluplné rozdelenie údajov, súvislú prácu a kvalitný koniec úlohy. Nevyžaduje to novú vizuálnu identitu ani množstvo ďalších dekoratívnych komponentov.
