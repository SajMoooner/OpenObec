# Ukážkové dáta a bezpečná obnova

Predvolené nové dáta obsahujú 12 realistických fiktívnych dokumentov pre každú agendu a 72 pripravených PDF so slovenskou diakritikou. Faktúry majú prirodzené evidenčné čísla, rôzne sumy a dátumy; prvé dve zmluvy prepájajú súvisiace dokumenty. Nejde o oficiálne záznamy mesta. Bežný seed nepoužíva knižnicu na tvorbu PDF a existujúce záznamy nikdy neprepisuje.

Staršie vlastné ukážkové záznamy sa obnovujú iba výslovným krokom:

```sh
python3 scripts/seed/seed.py --refresh-realistic         # iba náhľad vlastníctva a zmien
python3 scripts/seed/seed.py --refresh-realistic --apply # záloha a obnova preukázaných vlastných záznamov
```

Obnova zachová ID a väzby, overí pôvodný obsah aj známy PDF súbor a počká na čítaciu projekciu. Upravené alebo zmazané záznamy preskočí a uvedie vo výsledku. Pred zmenou uloží zdrojové údaje a metadáta príloh do `.run/seed-manifest-before-realistic-*.json`; postup je v `.run/seed-manifest-realistic-progress.json`. Po prerušení zopakujte rovnaký príkaz. Počas obnovy neupravujte tieto ukážkové dokumenty súčasne v portáli. Nový PDF sa nahrá pred odstránením preukázanej pôvodnej prílohy; ostatné súbory ostanú zachované. Tvorba alebo úprava samotných PDF je vývojový krok popísaný v [návode na tvorbu PDF](../scripts/seed/documents/README.md).

Podrobnosti o manifeste, konfliktoch a obnove projekcie: [prevádzkový postup](runbook.md).
