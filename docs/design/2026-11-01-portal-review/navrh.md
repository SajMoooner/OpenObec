# OpenObec — návrh kultivácie troch portálov

1. 11. 2026 · východisková verzia `4a3f798` · návrh schválený používateľom na implementáciu vrátane zlepšení ovládania.

## Odporúčaný smer

Zachovať shadcn/ui, Geist, farby IDSK3 a centrovanú šírku najviac 1280 px. Posun dosiahnuť lepšou hierarchiou obsahu, užitočnejšími prehľadmi a dôslednými detailmi ovládania. Marketing má ukázať hodnotu produktu; občiansky portál má viesť k dokumentu; pracovný portál má pomôcť dokončiť zverejnenie.

Schválený smer upravuje kompozíciu všetkých troch portálov v existujúcom vizuálnom štýle. Samotná zmena okrajov a tieňov nevyrieši orientáciu v detailoch. Úplná výmena štýlu podľa cudzej šablóny by zbytočne menila schválenú identitu a priniesla vzory, ktoré nesúvisia s dokumentmi obce. Používateľ schválil odporúčaný dizajn aj zlepšenia ovládania a potvrdil shadcn/ui a iba farby z IDSK3.

## Vizuálne pravidlá

- Marketing: zachovať tmavomodrý úvod, panorámu a obmedzenú šírku. Kratšie odseky, viac konkrétnych ukážok aplikácie, striedanie textu a rozhrania. Nadpisy nebudú rásť so šírkou ultrawide monitora.
- Občan: biely základ, jemné deliace čiary a svetlomodrý vyhľadávací úvod. Nadpisy a obsah majú pokojnú pevnú mierku. Žilina a označenie dema zostanú čitateľné aj na mobile.
- Úradník: zachovať rozpoznateľný tmavomodrý sidebar, zlepšiť jeho skupiny a aktuálny kontext. Jemná neutrálna plocha môže odlíšiť pracovné panely; farba primárne označuje akciu, výber alebo stav.
- Jedna hlavná akcia na pracovnej obrazovke, ostatné s menšou váhou. Deštruktívne akcie oddeliť od bežných. Stav vždy pomenovať textom.
- Konzistentné vnútorné okraje, nadpisy, výšky ovládacích prvkov a rozostupy. Nepridávať ozdobné štítky nad každý nadpis, animované pozadia ani grafy bez konkrétnej úlohy.
- Na mobile zachovať zoskupené údaje pri názve dokumentu, doplniť významný dátum a dostatočne veľké akcie. Formuláre majú jeden stĺpec; priľnavá lišta nesmie zakrývať posledné pole ani klávesnicový fokus.

## Marketingový portál — všetky štyri stránky

| Stránka | Súčasné miesto na zlepšenie | Navrhnutá úprava |
| --- | --- | --- |
| `/home` | Dominantná ukážka vyhľadávania ukazuje najmä občiansku časť. Prínosy pre úradníka sa vysvetľujú prevažne textom. | Zachovať centrovaný úvod. Pod ním ukázať dvojicu skutočných produktových pohľadov „Pre občana“ a „Pre úradníka“, s krátkym vysvetlením a konkrétnou cestou do dema. Súčasné vyhľadávanie ponechať funkčné. |
| `/vyhody` | Veľa textu a tabuľka, kde sa pri všetkých šiestich agendách opakuje rovnaká veta. | Dva ilustrované scenáre: nájdenie dokumentu so súvislosťami a príprava dokumentu s prílohou. Pri agendách uviesť rozdiely, ktoré používateľ skutočne potrebuje. Cena a FAQ zostanú vecné. |
| `/demo` | Dve možnosti sú zrozumiteľné, ale návštevník nevie, čím začať skúšanie. | Ku každému pohľadu pridať malú ukážku rozhrania a trojbodový scenár. Občan: vyhľadať → otvoriť súvislosť → stiahnuť prílohu. Úradník: vytvoriť koncept → pridať prílohu → zverejniť. |
| `/kontakt` | Stránka končí informáciou, že kontakt nie je nastavený. | Lepšie vysvetliť, čo možno dnes vyskúšať, a ponúknuť cestu do dema. Po dodaní skutočného kontaktu doplniť konkrétny kontakt alebo funkčný formulár. Nevytvárať formulár, ktorý správy iba predstiera. |

Navrhovaná čítacia cesta domovskej stránky: hodnota produktu → ukážka oboch pohľadov → konkrétne výhody → šesť agend → postup zverejnenia → navrhovaná cena → FAQ → demo.

Z Prodexy preberáme ukazovanie funkcií na rozhraní; z Kinta pokojný rytmus a príbeh používania. Použijeme vlastné obrazovky OpenObec. Suma 199 € zostáva označená ako cenový návrh; nebudú doplnené vymyslené referencie, výsledky úspor ani právne garancie.

## Občiansky portál — úvod, šesť zoznamov a šesť detailov

| Stránka alebo stav | Navrhnutá úprava | Prínos |
| --- | --- | --- |
| `/obcan/home` | Jasne ohraničený, vzdušný vyhľadávací úvod. Pridať krátke príklady založené na dostupných demo dokumentoch. Pri agendách jeden krátky opis a odlišná zrozumiteľná ikona. | Občan môže začať hľadaním aj bez znalosti úradnej terminológie. |
| Výsledky na úvode | Najprv celkový výsledok a agendy so zhodami. Prázdne agendy zhrnúť kompaktne. Oznámiť neúplné výsledky, ak niektorá služba neodpovedá. | Jedna neúspešná fráza nevytvorí šesť blokov „žiadne zhody“. Zachová sa už existujúca ochrana čiastočných výsledkov. |
| `/obcan/[agenda]` — všetkých šesť | Jedna lišta: vyhľadávanie, počet výsledkov a zoradenie. Viditeľný aktuálny výber a „Zrušiť vyhľadávanie“. Kontext a filtre uchovať pri návrate z detailu. Stĺpce prispôsobiť agende. | Občan rozumie, na čo sa pozerá, a nestratí hľadanie pri otvorení dokumentu. |
| `/obcan/[agenda]/[id]` — všetkých šesť | Hore titulok, číslo a hlavné údaje. Prílohy presunúť bližšie k úvodu; na širšej obrazovke môžu byť v pravom stĺpci. Nižšie podrobnosti a súvisiace dokumenty s jasným počtom a typom. | Dôležitá suma, organizácia, termín a stiahnutie sú ľahko dostupné. |
| VZN | Vysvetliť skratku ako „Všeobecne záväzné nariadenia“. Uprednostniť schválenie a účinnosť; neukazovať prázdny stĺpec sumy. | Stránka používa význam údajov konkrétnej agendy. VZN zostáva samostatnou evidenciou bez súvislostí. |
| Prázdne, načítavacie a chybové stavy | Zachovať skeletony a opakovanie požiadavky. Prázdny výsledok doplniť obnovením celého zoznamu; výpadok odlíšiť od neprítomnosti dokumentov. | Každý stav ponúka zrozumiteľný ďalší krok. |

Scalar slúži ako referencia pre čitateľnosť a členenie, najmä jeho dokumentačná časť. Verejný portál zostane priamo použiteľným vyhľadávačom dokumentov bez registrácie.

### Obsah zoznamov podľa agendy

Všetky uvedené polia už existujú v modeloch. Ide o ich lepšie zobrazenie; nie o prísľub nových filtrov či výpočtov.

| Agenda | Hlavné údaje v zozname a súhrne detailu |
| --- | --- |
| Faktúry | Predmet a číslo, **odberateľ**, dátum vystavenia, suma s DPH. Splatnosť v detaile. Vysvetliť, že ide o odberateľské faktúry. |
| Dodávateľské faktúry | Predmet a číslo, **dodávateľ**, dátum vystavenia, suma s DPH. Splatnosť v detaile. |
| Zmluvy | Predmet a číslo, zmluvná strana, účinnosť, suma s DPH; podpis a prípadná platnosť v detaile. |
| Objednávky | Predmet a číslo, dodávateľ, dátum objednania, suma s DPH; termín dodania, ak existuje. |
| Verejné obstarávanie | Názov a číslo, **stav obstarávania**, lehota predkladania, **predpokladaná hodnota bez DPH**. Nezamieňať stav obstarávania so stavom zverejnenia. |
| VZN | Názov a číslo, schválenie, účinnosť, prípadná platnosť. Bez peňažného stĺpca a bez súvisiacich agend. |

Technický čas vytvorenia záznamu nesmie pôsobiť ako dátum dokumentu alebo dátum zverejnenia. Aktuálne `RecordsTable` zobrazuje `created_at` pod všeobecným „Dátum“; občiansky úvod zoraďuje podľa vytvorenia pod názvom „Naposledy zverejnené“. V prvej úprave spresniť názvy a používať príslušné doménové dátumy. Skutočnú históriu dátumov zverejnenia by musel spoľahlivo poskytovať dátový model.

Živá kontrola zároveň potvrdila, že po vyhľadaní dvoch zmlúv, otvorení detailu a použití odkazu späť na zmluvy sa obnoví celý zoznam bez vyhľadávacieho výrazu. Zachovanie kontextu preto rieši konkrétny existujúci problém.

## Úradnícky portál — všetkých 27 stránok

| Stránka alebo stav | Navrhnutá úprava | Prínos |
| --- | --- | --- |
| `/uradnik/prihlasenie` | Zachovať vstup jedným tlačidlom. Usporiadať úvod, krátky opis práce a označenie Žilina/demo do jedného kompaktného bloku. | Človek okamžite vie, kam vstupuje a že nepotrebuje heslo. |
| `/uradnik/home` | Nad agendami ukázať súhrn **všetky dokumenty / koncepty / zverejnené**, potom „Pokračovať v rozpracovaných“ a posledné zmeny. Existujúce počty podľa agend ponechať v menšej váhe. | Prehľad pomáha začať prácu, nie iba sledovať počty. Koncept neoznačovať automaticky za chybu alebo nesplnenú povinnosť. |
| `/uradnik/[agenda]` — šesť stránok | Jasná hlavná akcia „Pridať…“, jednotná lišta filtrov, viditeľné Koncepty / Zverejnené, počet výsledkov a stĺpce podľa agendy. Zjednotiť stavové štítky a umiestnenie akcií. | Menej hľadania ovládania pri prechode medzi agendami. |
| `/uradnik/[agenda]/novy` — šesť stránok | Rozdeliť dlhý formulár na údaje, organizáciu/termíny, súvislosti a prílohy. Pridať jasne dostupné „Uložiť koncept“ a „Uložiť a zverejniť“, s vysvetlením účinku. | Úradník rozumie postupu a nemusí zakaždým hľadať koncové tlačidlá. |
| `/uradnik/[agenda]/[id]/upravit` — šesť stránok | Použiť rovnaké skupiny ako pri vytvorení, výrazne ukázať číslo a aktuálny stav dokumentu. Pri zverejnenom dokumente uviesť, že uloženie mení verejný obsah. Upozorniť pri odchode s neuloženými zmenami. | Nižšie riziko straty práce alebo nepochopenia účinku uloženia. |
| `/uradnik/[agenda]/[id]` — šesť stránok | Hore kompaktný súhrn a zreteľný stav. Úpravu, zverejnenie a stiahnutie zo zverejnenia hierarchicky odlíšiť; vymazanie oddeliť. Blízko súhrnu sprístupniť prílohy a verejný pohľad, ak je dokument zverejnený. | Kontrola dokumentu a ďalší krok sú na jednom mieste. |
| Výber súvislostí | Zachovať vyhľadávanie, výber agendy, počty a stránkovanie. Vybrané záznamy pomenovať názvom/číslom, nie samotným identifikátorom. Spätné odkazy vysvetliť ako „Dokumenty, ktoré odkazujú na tento záznam“. | Menej technického slovníka a lepšia orientácia pri úprave už uložených väzieb. |
| Prílohy | Prehľadný zoznam súborov s typom, veľkosťou a stavom nahrávania. Zachovať limity a obnovu po čiastočne úspešnom uložení. Označenie MIME typu zmeniť na ľudský názov PDF/PNG/JPEG. | Používateľ rozlíši vybraný, nahratý a neúspešný súbor. |
| `/uradnik/settings` | Jeden panel systému s viditeľným stavom **Simulácia**, stručným vysvetlením a výsledkom kontroly. Nemeniteľné hodnoty zobrazovať ako údaje, nie ako zdanlivo editovateľné vstupy. | Nastavenie pôsobí hotovo a zároveň pravdivo vysvetľuje hranice dema. |

Admin je referencia na organizáciu práce a tabuľkové ovládanie. Pre OpenObec nenavrhujem obratové grafy, percentuálne trendy ani desiatky modulov. Súhrn konceptov a zverejnených dokumentov možno získať z existujúcich filtrov API; úplné počty sa nesmú vypočítať iba z prvých desiatich načítaných riadkov.

Živá kontrola úpravy existujúcej zmluvy potvrdila zobrazenie štyroch väzieb internými identifikátormi. Zobrazenie čísla a názvu už existujúceho dokumentu je potrebná oprava použiteľnosti. Pri zverejnenom dokumente má byť „Stiahnuť zo zverejnenia“ sekundárnou akciou; úspešný výsledok má viesť k úprave alebo občianskemu náhľadu.

## Čo je dizajn a čo už rozšírenie správania

**Zobrazenie existujúcich dát:** rozloženie, typografia, navigačné zvýraznenie, doménové stĺpce, súhrn detailu, prílohy, presné pomenovania, vizuálna váha akcií, marketingové ukážky.

**Malé úpravy správania vo frontende:** uchovanie hľadania/strany/zoradenia v URL, reset filtrov, súhrn výsledkov, zoznam rozpracovaných dokumentov, súhrnné počty z existujúcich API filtrov, ochrana neuložených zmien. Tieto návrhy potrebujú samostatné funkčné overenie; nie sú iba úpravou CSS.

**Ďalší rozsah, ktorý návrh automaticky nezahŕňa:** nové serverové filtre podľa dodávateľa, roku alebo sumy, skutočný čas/história zverejnenia, automatické termínové upozornenia, hromadné zverejňovanie, exporty, reálne kontaktovanie, mestské integrácie, účty a autentifikácia. Pridať ovládanie až spolu so skutočnou funkciou.

## Poradie odporúčaných úprav

1. Spoločné vzory: nadpis s kontextom, navigácia, tabuľky, stavové štítky a presné dátumy/sumy. Zlepšia veľa stránok naraz.
2. Občiansky úvod, zoznamy a detaily. Najkratšia cesta od hľadania k prílohe a súvisiacemu dokumentu.
3. Pracovný prehľad, editor a detail. Dôraz na koncepty, uloženie a zverejnenie.
4. Marketingové stránky, už s kvalitnejšími ukážkami upravených portálov.
5. Jedna záverečná vizuálna kontrola na mobile, tablete, bežnom a širokom monitore; kontrola klávesnice, chýb, prázdnych stavov a dlhých názvov.

Toto poradie je implementačné odporúčanie. Návrh nemení backendové kontrakty ani uložené dokumenty.

## Kritériá prijatia budúcej úpravy

- Všetkých 44 obsahových stránok/variantov má zodpovedajúce rozloženie: 4 marketing, 13 občan, 27 úradník. Presmerovania a chybové stavy sa overia zvlášť.
- Obsah zostáva ohraničený na širokom monitore; pri 390 px nemá stránka horizontálny presah. Lokálny posun dátového prvku musí byť zjavný a nesmie schovávať jeho hlavnú akciu.
- Človek rozlíši faktúru od dodávateľskej faktúry, stav obstarávania od zverejnenia a sumu bez DPH od sumy s DPH.
- Návrat z detailu zachová hľadanie. Prázdny výsledok ponúkne jasný návrat k všetkým dokumentom.
- Zverejnenie, úprava zverejneného dokumentu a odchod s rozpracovanými zmenami majú zrozumiteľné následky.
- Každá viditeľná validačná chyba má aj programové prepojenie s príslušným poľom; doplniť chýbajúce prepojenie pri stave obstarávania. Karty prehliadača pomenovať podľa agendy alebo úlohy.
- Príloha a najdôležitejšie údaje sú dostupné bez prečítania celého detailu. Dlhé názvy sa zalomia.
- Stav dema, simulácia IS a navrhovaná cena zostávajú pravdivo označené.

Podklad: [pozorovania referencií](references.md), nezávislé posúdenie dizajnu a oddelená kontrola rozhrania v tomto priečinku. Audit opisuje východiskový stav; realizáciu zachytáva plán `docs/superpowers/plans/2026-11-01-portal-refinement.md`.

## Dodatočné požiadavky používateľa počas implementácie

Používateľ následne požiadal o realisticky pôsobiace dáta namiesto názvov typu „syntetický záznam“ a o krátke showcase video v úvodnej prezentácii produktu. Rozšírenie je schválené priamo týmito požiadavkami.

- Upraviť vlastné ukážkové dáta: prirodzené slovenské názvy dokumentov a fiktívnych organizácií, evidenčné čísla, rôzne primerané sumy, dátumy, stavy a obsah PDF. Zachovať identifikátory, väzby, rozpracované/zverejnené stavy a cudzie používateľské zmeny. Označenie ukážkového prostredia zostáva pravdivé; dáta nevydávať za oficiálne záznamy Žiliny.
- Úvodný register na priloženom obrázku nahradiť krátkym videom reálneho priebehu: úradník otvorí portál a faktúry, vyplní faktúru, priloží PDF, zverejní ju; občan následne nájde rovnakú faktúru. Ponechať cestu do oboch portálov a funkčné vyhľadávanie v kompaktnejšej podobe.
- Video má vlastné ovládanie prehrávania, statický úvodný obraz a textové vysvetlenie krokov. Bez zvuku alebo automatického prehrávania, ktoré by rušilo návštevníka. Záznam používa iba vlastné fiktívne údaje a skutočný lokálny pracovný postup.

### Najnovšie spresnenie: snímky na webe, video na GitHube

Používateľ následne výslovne nahradil video na úvodnej stránke požiadavkou na skutočné snímky platformy s peknou animáciou. Úvod teda ukazuje tri kroky tej istej faktúry: vyplnenie, zverejnenie a občiansky detail. Jemný prechod vysvetľuje postup; používateľ môže kroky prepnúť alebo pozastaviť. Automatické striedanie sa zastaví mimo obrazovky alebo na skrytej karte, obmedzenie pohybu je rešpektované. Úvodná stránka nenačítava video. Toto spresnenie je aktuálna vizuálna autorita pre ukážku.

Dokončený záznam reálneho postupu zostáva v dokumentácii pre GitHub. Používateľ tiež schválil zverejnenie celého projektu do existujúceho verejného repozitára, zrozumiteľné README pre otvorený projekt a následne výslovne vybral licenciu MIT. Prípravu dokumentácie a overené odoslanie zachytáva Task6 realizačného plánu; nejde o nasadenie produkčných služieb.
