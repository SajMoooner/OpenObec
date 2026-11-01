# OpenObec

Projekt troch portálov na vyhľadávanie a zverejňovanie dokumentov samosprávy. Prvá verzia je lokálne demo pre Žilinu.

## Aktuálny stav

Analyzované sú štyri návrhové dokumenty a pripravený realizačný návrh. Samotná aplikácia sa ešte neimplementovala; návrh čaká na schválenie pred implementáciou podľa požadovaného postupu Superpowers.

- [Realizačný návrh](docs/superpowers/specs/2026-11-01-openobec-design.md)
- [Analýza podkladov a mapa 46 API operácií](docs/analysis/2026-11-01-source-review.md)
- [Potvrdený produktový kontext](PRODUCT.md)
- [Snímky vstupných dokumentov a ich pôvod](docs/references/2026-11-01/manifest.json)

## Potvrdený základ

Tri samostatné Next.js aplikácie, shadcn/ui s fontmi a farbami IDSK, Java API, šesť oddelených doménových MongoDB databáz a spoločná čítacia MongoDB pre párovanie a Query API. Kafka prenáša udalosti; RustFS uchováva prílohy. Marketing začne obrazovým návrhom. Reálne prihlásenie, prepojenie mestského IS a externé registre sú mimo prvého dema.

Presné overené príkazy spúšťania pribudnú spolu s aplikáciami. Návrh požaduje celý Docker stack aj samostatné ručné spustenie každej aplikácie s infraštruktúrou v Dockeri.
