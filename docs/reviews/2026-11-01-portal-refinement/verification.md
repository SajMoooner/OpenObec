# Overenie finálnej úpravy OpenObec

Rozsah od `625fc6d` (rovnaký produktový kód ako pôvodný `4a3f798`). Autorita: [schválený návrh](../../design/2026-11-01-portal-review/navrh.md) a [realizačný plán](../../superpowers/plans/2026-11-01-portal-refinement.md), vrátane následného rozhodnutia používateľa: snímky s animáciou na webe, video na GitHube, otvorený projekt pod MIT.

## Výsledok implementácie

- Tri portály zachovávajú shadcn/ui, Geist a farby IDSK3. Spoločné tabuľky majú údaje podľa agendy, návrat zachová filtre, detail uprednostňuje prílohy a editor chráni rozpracovanú prácu.
- Marketing má reálne obrazovky, konkrétne scenáre a tri animované kroky tej istej faktúry. Má manuálne prepínanie, pozastavenie a obmedzený pohyb; úvod nenačítava video.
- Všetkých 72 pôvodných ukážkových identít a väzieb bolo zachovaných pri obnove realistických údajov a PDF. Následná používateľská úprava jednej faktúry zostala nedotknutá (71 záznamov zhodných s obnoveným základom + 1 upravený). Nová faktúra 0057 vznikla výhradne pre skutočnú ukážku; v čase záznamu bol počet 73, z toho 24 konceptov / 49 zverejnených. Neskoršie používanie môže počty meniť.
- Záznam skutočného postupu má 39,24 s, VP9/WebM, 1280×800 a 3 458 209 bajtov. Zdrojový aj občiansky dokument majú rovnaké ID; autorovaný, zdrojový a občiansky PDF rovnaký SHA-256. [Video a pôvod](../../media/showcase/README.md).
- README, MIT licencia, prispievanie, oznámenia tretích strán a médiá sú zverejnené na [GitHube](https://github.com/SajMoooner/OpenObec). Záverečný úplný [CI beh](https://github.com/SajMoooner/OpenObec/actions/runs/41410124949) na revízii `60530be` prešiel úspešne.

Pred prerušením bolo všetkých 21 kontajnerov spustených a zdravých. Pri pokračovaní 2. 11. 2026 Docker nebežal (chýbajúci socket); aktuálna živá pripravenosť sa preto netvrdí. Uložené úspešné behy zodpovedajú uvedeným revíziám.

## Automatické overenie

| Kontrola | Výsledok a rozsah |
|---|---|
| Finálny celý CI na GitHube | **ÚSPECH**, revízia `60530be6ec1e018b9a4c3414158e3c1680fc249f`, 2. 11. 2026. 12 kontraktových, 27 runtime, 148 Java, 23 frontendových, 13 smoke a **69/69 prehliadačových skúšok**; typy, lint, všetky tri zostavenia a úplný štart. [Strojový záznam krokov](ci-success.json), [výpis výsledkov](ci-success.txt). Nižšie sú zachované aj skoršie lokálne dôkazy. |
| Celý prehliadač | 59/59 prešlo na finálnej aplikácii 413b520, 50,0 s, exit 0. [Úplný log](browser-suite.log). Príkaz `env -u NO_COLOR pnpm test:e2e` odstránil konflikt farieb v prostredí.|
| Prenositeľnosť nového testu |Následne upravené hľadanie z lokálnej faktúry 0057 na štandardný zverejnený seed 0041; zmenený prípad 1/1 prešiel, nezávislá kontrola opravy schválená. Bez úpravy dát alebo oslabenia kontroly výsledku.|
| Frontend | 23 jednotkových testov prešlo; typy a lint prešli na finálnom UI. Po poslednej úprave testu celý projektový `pnpm lint` opäť exit 0 bez varovaní.|
| Produkčné zostavenia |Všetky 3 aplikácie prešli. Po zmene umiestnenia videa znovu zostavený marketing; občan/úradník ani spoločné jadro sa nemenili.|
| Nové marketingové správanie | 28 marketingových/regresných kontrol a 4 zamerané skúšky vrátane obrázkov bez JS, klávesnice, redukovaného pohybu a pozastavenia mimo obrazovky/skrytej karty.|
| Údaje a PDF | 6 runtime skúšok, existujúce integračné skúšky a 7 finálnych migračných prípadov; všetkých 72 PDF parsovaných, reprezentatívne PDF vizuálne overené. Vlastníctvo, opakovanie, prerušenie a cudzie úpravy testované. Podrobné presné behy v [task-4-report.md](task-4-report.md).|
| Dokumentácia | 40 relatívnych odkazov/aktív,9 príkazov, 11 ciest a texty licencií overené. Nezmenené Java testy sa v tejto UI/dokumentačnej úprave neopakovali.|

Nezávislé taskové kontroly 1–6 schválili zhodu a kvalitu. Neskoršie doplnené opravy majú vlastné záznamy. Varovanie izolovaného ESLint behu o detekcii Reactu sa pri plnom projektovom linte nevyskytlo; nepridávali sa kvôli nemu závislosti ani konfigurácia.

## Skutočná kontrola rozhrania

[Matica](native-route-matrix.json) obsahuje 44 obsahových trás × 390/768/1440 px = 132 jedinečných kombinácií. Skutočná šírka a cieľová cesta sa overili pri každej návšteve jednej karty. Všetky majú hlavný nadpis a dobehnuté načítanie, bez vodorovného presahu stránky/tabuľky či zobrazených chýb. Po používateľovej zmene bol nový úvod opäť skontrolovaný vo všetkých veľkostiach; nezmenené trasy neboli zbytočne opakované.

Ďalších 8 pozorovaní pokrylo štyri marketingové stránky pri 2560/3440 px: obsah má maximálne 1280 px a je presne centrovaný v dostupnej šírke. Aktuálne snímky sú v priečinku [showcase](showcase/). Ide o pozorovania živých stránok a vybrané vizuálne snímky, nie 132 samostatných screenshotov.

Všetkých 6 prázdnych formulárov zobrazilo 8/8/6/5/7/5 chýb, každú prepojenú s poľom; fokus prešiel na súhrn. Odkaz na chybné pole ostal nad spodným ovládaním. Overené prázdne hľadanie/reset, mobilné menu/Escape/návrat fokusu a nová ukážka: manuálna voľba, ArrowRight, automatický prechod a pauza. Konzola bez varovaní/chýb. Chybové API, čiastočné uloženie, história/návrat, presné termíny a publikovanie/PDF pokrývajú testy prehliadača.

Skorší pokus s dvomi kartami mal neúplnú kontrolu skutočnej šírky; bol nahradený uvedenou overenou maticou. Historické video-prehrávačové skúšky sa neprezentujú ako konečné správanie úvodnej stránky.

## Impeccable a vizuálna autorita

Celý zmenený UI rozsah: [detektor](impeccable-detector.json), exit 0, jediná poradná poznámka k existujúcej farbe výberu textu `#c3d9f9` v nezmenenom globals.css. DESIGN.md túto farbu výslovne zachováva. Po následnej zmene na snímky bol zopakovaný iba dotknutý úvod: [detektor úvodu](impeccable-showcase-detector.json), exit 0, žiadne nálezy.

Pôvodné obrazové porovnanie so širokým compom zostáva historicky otvorené a neúspešné (0,63); nebol použitý vynútený úspech ani zamenený comp. Novšia používateľská požiadavka schválila centrovaný marketing a potom screenshotovú animáciu. Súčasný záznam viaže prijatie na aktuálne zdroje, snímky a funkčné dôkazy; staré skóre sa neprepisuje.

## Dokončenie

- [x] Záverečná kontrola celého rozsahu a vyriešenie nálezov jednou opravnou vlnou; následná kontrola bez nových nálezov.
- [x] Overený push do existujúceho GitHub repozitára, kontrola README/licencie/médií a úspešný úplný vzdialený CI.

## Finálne opravy po nezávislej kontrole

[Kontrola celého rozsahu](final-review.md) našla štyri konkrétne okrajové stavy. Commit `75dd3f6` opravil návrat z prázdnej zachovanej strany so zachovaním filtrov, zalomenie dlhého názvu prílohy na mobile, správny názov cieľovej agendy v návratovom odkaze a výber skutočne najnovších dokumentov naprieč agendami. [Kontrola opráv](final-fix-review.md) označila všetky štyri za vyriešené bez nových nálezov.

Na nových produkčných zostaveniach občana/úradníka prešlo **30/30** dotknutých prehliadačových skúšok (21,6 s), vrátane 10 nových prípadov a rozšíreného testu opakovaného uploadu. Znovu prešlo 23 jednotkových skúšok, typy a lint. [Úplný výsledok](final-fix-evidence/green.log), [opis a príkazy](final-fix-report.md). Celý skorší 59-testový balík sa nezopakoval; nezmenené scenáre majú predchádzajúci dôkaz a zmenené časti čerstvý beh.

Ručne bol na 390 px potvrdený návrat zo strany 999 v oboch portáloch, správne URL po návrate a nulový vodorovný presah. Výber súboru cez natívny dialóg bol prerušený; jeho ručný úspech sa netvrdí. Dlhý názov prílohy vrátane validačnej chyby, neúspešného uploadu a zachovania pri odmietnutí odchodu overili uvedené prehliadačové skúšky. [Detektor piatich zmenených UI súborov](impeccable-final-fix-detector.json): exit 0, bez nálezov.

Všetky prijaté procesné rozhodnutia a ich dôsledky: [záznam rozhodnutí](rulings.md). [Pracovný denník](execution-ledger.md) zachováva postup aj historické priebežné stavy; konečný výsledok publikácie je uvedený nižšie.

## Zverejnenie a čisté spustenie na GitHube

Projekt bol 2. 11. 2026 odoslaný na `main` aj `codex/openobec-demo` v [SajMoooner/OpenObec](https://github.com/SajMoooner/OpenObec). Prvá publikovaná revízia `2fa3338` obsahuje celé aplikácie, README, MIT licenciu aj video. Vzdialený commit a zhodu obsahu README/licencie/videa potvrdili GitHub API a Git blob identifikátory; GitHub rozpoznal MIT.

[Prvý automatický beh](https://github.com/SajMoooner/OpenObec/actions/runs/41404577570) narazil po úspešnom štarte démonov na čakanie na už ukončené inicializačné úlohy. [Výpis chyby](ci-startup-failure.txt), [diagnóza a oprava](ci-fix-report.md). Commit `41f7d79` kontroluje aj ukončené úlohy, ich návratové kódy a spoločný časový limit bez potlačenia skutočných chýb. Prešlo 11 cielených regresií, celá sada 19 runtime a 12 kontraktových skúšok, syntax, kompilácia a obe Compose konfigurácie. [Nezávislá kontrola](ci-fix-review.md) schválila súlad aj kvalitu bez nálezov.

Oprava bola odoslaná v revízii `e65d6a9`. [Druhý automatický beh](https://github.com/SajMoooner/OpenObec/actions/runs/41406073384) úspešne overil infraštruktúru, kontrakty, runtime, Java služby, frontend aj celý štart dema. Hromadné smoke skúšky následne dosiahli nezmenený limit API; živá obnova dát a jej upratovanie skončili HTTP 429. [Výpis](ci-throttle-failure.txt).

Commit `aaeb130` doplnil iba bezpečné, ohraničené opakovanie výslovne odmietnutých HTTP 429 v spoločnom seed transporte. Rešpektuje `Retry-After`, nemení limity API a neopakuje nejasné chyby zápisov. Prešlo 8 transportných regresií, 27 runtime, 12 kontraktových a 8 offline skúšok obnovy dát. [Opis a výsledky](ci-throttle-report.md), [nezávislá kontrola](ci-throttle-review.md): súlad aj kvalita schválené bez nálezov. Úplný vzdialený beh sa zopakuje po odoslaní tejto opravy.

[Tretí beh](https://github.com/SajMoooner/OpenObec/actions/runs/41408422911), revízia `d994d7f`, úspešne dokončil aj celé živé smoke skúšky vrátane obnovy dát. Z 69 prehliadačových scenárov prešlo 67; dve testové kontroly nedokázali rozlíšiť súčasne prítomné potvrdenie úspechu a indikátor načítania ([výpis](ci-status-failure.txt)). Obe očakávané potvrdenia v rozhraní existovali. Commit `29b4e7a` spresnil iba dva testové selektory a zachoval všetky pôvodné kontroly. [Overenie](ci-status-report.md) zahŕňa reálny prehliadač s oboma stavmi, negatívne prípady, zber 69 testov, lint a typy; [kontrola opravy](ci-status-review.md) je bez nálezov. Ďalší úplný CI beh overí konečnú verziu.

[Štvrtý, finálny beh](https://github.com/SajMoooner/OpenObec/actions/runs/41410124949), revízia `60530be6ec1e018b9a4c3414158e3c1680fc249f`, skončil 2. 11. 2026 o 08:11 UTC úspešne. Všetky kroky prešli vrátane čistého štartu služieb, 70 konkrétnych HTTP odpovedí overených voči kontraktu, ochrany používateľských úprav pri obnove dát a **69 prehliadačových scenárov za 1,5 minúty**. Žiadny scenár nebol preskočený. Finálny dokumentačný commit pridáva iba tieto dôkazy, stav plánu a archív denníka; aplikácie, konfigurácia, testy, README, licencia a médiá zostávajú zhodné s overenou revíziou. Úplný CI sa pre samotný archív výsledku neopakuje.
