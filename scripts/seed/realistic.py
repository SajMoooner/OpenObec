"""Deterministic fictional municipal examples. No real transactions or identifiers."""
from copy import deepcopy
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

VERSION = 'realistic-2026-v1'
AGENDAS = ('faktury', 'dodavatelske-faktury', 'zmluvy', 'objednavky', 'verejne-obstaravanie', 'vzn')
WORK = [
 ('Obnova interiéru mestskej knižnice', 'Drevodielňa Pod Lipami, s. r. o.', '45421000-4', '18450.80'),
 ('Výsadba stromov v parku Pri potoku', 'Zelený dvor záhradníctvo, s. r. o.', '77310000-6', '6840.50'),
 ('Revízia verejného osvetlenia na Jarnej ulici', 'Svetelná dielňa Sever, s. r. o.', '50232100-1', '2375.40'),
 ('Výmena svietidiel verejného osvetlenia na Lipovej ulici', 'Svetelná dielňa Sever, s. r. o.', '45316110-9', '12780.25'),
 ('Oprava chodníka pri materskej škole', 'Kamenná cesta stavby, s. r. o.', '45233161-5', '9350.60'),
 ('Servis kotolne kultúrneho domu', 'Teplý dom servis, s. r. o.', '50720000-8', '1180.75'),
 ('Dodanie lavičiek na námestie', 'Mestský mobiliár Lúka, s. r. o.', '39113600-3', '4320.20'),
 ('Obnova dopravného značenia pri školách', 'Cestná farba, s. r. o.', '45233221-4', '3615.90'),
 ('Digitalizácia obecnej kroniky', 'Pamäť regiónu ateliér, s. r. o.', '79999100-4', '2150.45'),
 ('Čistenie dažďových vpustov', 'Čistý tok služby, s. r. o.', '90470000-2', '1864.30'),
 ('Oprava strechy hasičskej zbrojnice', 'Strešná dielňa Hrebeň, s. r. o.', '45261900-3', '15470.15'),
 ('Dodanie nádob na triedený odpad', 'Obeh materiálov, s. r. o.', '44613800-8', '5278.65'),
]
INCOME = [
 ('Preúčtovanie príspevku na obnovu interiéru mestskej knižnice', 'Združenie Priatelia čítania'),
 ('Preúčtovanie príspevku na výsadbu stromov v parku Pri potoku', 'Spolok Susedia pri potoku'),
 ('Prenájom sály na odborný seminár', 'Vzdelávacie centrum Mosty, s. r. o.'),
 ('Náhrada nákladov na úpravu verejného osvetlenia pri podujatí', 'Kultúrny spolok Jarná scéna'),
 ('Prenájom obecného pozemku pre záhradkársku výstavu', 'Záhradkársky spolok Pod hájom'),
 ('Refakturácia energií v kultúrnom dome', 'Divadelný spolok Opona'),
 ('Prenájom stánkov na jesennom trhu', 'Remeselný kruh Lipová'),
 ('Preúčtovanie tlače informačných letákov', 'Združenie Bezpečná cesta do školy'),
 ('Reprodukcie historických fotografií z kroniky', 'Regionálne vydavateľstvo Stránka, s. r. o.'),
 ('Prenájom techniky na komunitný deň', 'Spolok Rodinná lúka'),
 ('Náhrada nákladov na školenie dobrovoľníkov', 'Združenie Pomoc susedom'),
 ('Prenájom zasadacej miestnosti', 'Jazykové centrum Rozhovor, s. r. o.'),
]
INCOME_NET = ['2460.10', '1140.25', '185.50', '426.75', '320.00', '618.42', '975.30', '148.60', '86.40', '274.90', '392.15', '165.80']
VZN = [
 ('o prevádzkovom poriadku mestskej knižnice', 'Knižničné služby, registrácia čitateľov a výpožičné lehoty.'),
 ('o ochrane stromov a verejnej zelene', 'Pravidlá užívania parkov a starostlivosti o zelené plochy.'),
 ('o podmienkach nočného osvetlenia verejných priestorov', 'Časové režimy osvetlenia a oznamovanie porúch.'),
 ('o nakladaní s komunálnym odpadom', 'Triedený zber a umiestnenie zberných nádob.'),
 ('o prevádzke trhových miest', 'Prevádzkový čas trhu a povinnosti organizátora.'),
 ('o poskytovaní dotácií z rozpočtu mesta', 'Predkladanie žiadostí a vyúčtovanie komunitných projektov.'),
 ('o užívaní verejných priestranstiev', 'Dočasné umiestnenie zariadení a obnova povrchu.'),
 ('o školských obvodoch základných škôl', 'Vymedzenie spádových ulíc pre zápis detí.'),
 ('o prevádzke pohrebiska', 'Návštevné hodiny a údržba spoločných priestorov.'),
 ('o podmienkach držania psov', 'Pohyb psov na verejných miestach a čistota priestranstiev.'),
 ('o pravidlách podpory kultúrnych podujatí', 'Podmienky poskytnutia mestských priestorov a vybavenia.'),
 ('o komunitnom kompostovaní', 'Zber biologického odpadu a používanie kompostovísk.'),
]


def catalog(agenda, index, prefix='DEMO-2026'):
    """Default human numbers; custom prefixes isolate disposable integration fixtures."""
    title, supplier, cpv, net = WORK[index]
    day = date(2026, 1, 12) + timedelta(days=24 * index)
    number = {'faktury': f'FV/2026/{41+index:04d}', 'dodavatelske-faktury': f'DF/2026/{187+index:04d}',
              'zmluvy': f'ZM/2026/{34+index:04d}', 'objednavky': f'OBJ/2026/{96+index:04d}',
              'verejne-obstaravanie': f'VO/2026/{12+index:04d}', 'vzn': f'{4+index}/2026'}[agenda]
    if prefix != 'DEMO-2026':
        number = f'{prefix}-{AGENDAS.index(agenda)+1:02d}-{index+1:03d}'
    row = {'cislo': number, 'predmet': title, 'zverejnene': index % 3 != 2}
    party = {'nazov': supplier}
    net = Decimal(net)
    total = lambda value: format((value * Decimal('1.23')).quantize(Decimal('.01'), rounding=ROUND_HALF_UP), '.2f')
    if agenda in ('faktury', 'dodavatelske-faktury'):
        if agenda == 'faktury':
            row['predmet'], customer = INCOME[index]
            party = {'nazov': customer}
            net = Decimal(INCOME_NET[index])
        row.update({('odberatel' if agenda == 'faktury' else 'dodavatel'): party,
                    'datum_vystavenia': str(day + timedelta(days=47)), 'datum_splatnosti': str(day + timedelta(days=77)),
                    'suma_bez_dph': format(net, '.2f'), 'suma_dph': format(Decimal(total(net))-net, '.2f'), 'suma_s_dph': total(net), 'mena': 'EUR'})
    elif agenda == 'zmluvy':
        row.update(zmluvna_strana=party, datum_podpisu=str(day), datum_ucinnosti=str(day + timedelta(days=1)), suma_s_dph=total(net), mena='EUR')
    elif agenda == 'objednavky':
        row.update(dodavatel=party, datum_objednania=str(day + timedelta(days=4)), termin_dodania=str(day + timedelta(days=44)), suma_s_dph=total(net), mena='EUR')
    elif agenda == 'verejne-obstaravanie':
        # First two represent completed linked awards; later published calls remain open.
        deadline = day - timedelta(days=8) if index < 8 else date(2026, 11, 16) + timedelta(days=7*(index-8))
        if index >= 8:
            title = ['Digitalizácia obecnej kroniky - ďalšie zväzky na rok 2027', 'Čistenie dažďových vpustov - údržba na rok 2027', 'Oprava strechy hasičskej zbrojnice - druhá etapa v roku 2027', 'Dodanie nádob na triedený odpad - rozšírenie siete v roku 2027'][index-8]
            row['predmet'] = title
        row.update(nazov=title, cpv=cpv, predpokladana_hodnota_bez_dph=format(net + Decimal('750.00'), '.2f'), mena='EUR',
                   lehota_predkladania=str(deadline)+'T11:00:00Z', stav='ukoncene' if index < 8 else 'otvorene')
    elif agenda == 'vzn':
        row.update(predmet=VZN[index][1], nazov=f'Všeobecne záväzné nariadenie {VZN[index][0]}', datum_schvalenia=str(day), datum_ucinnosti=str(day+timedelta(days=16)))
    return deepcopy(row)


def document_path(agenda, index):
    return Path(__file__).parent / 'documents' / f'{agenda}-{index+1:02d}.pdf'
