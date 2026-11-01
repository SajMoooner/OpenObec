#!/usr/bin/env python3
"""Development-only PDF authoring. Ordinary startup does not import reportlab.

Showcase: generate_document('faktury', invoice_payload, Path('/tmp/invoice.pdf')).
CLI: --agenda faktury --payload /tmp/invoice.json --output /tmp/invoice.pdf
"""
import argparse
import json
import os
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from realistic import AGENDAS, catalog, document_path

FONT_ROOT = Path(os.environ.get('OPENOBEC_PDF_FONTS', Path.home() / '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pdfjs-dist/standard_fonts'))
LABELS = {'faktury': 'Faktúra', 'dodavatelske-faktury': 'Dodávateľská faktúra', 'zmluvy': 'Zmluva o poskytnutí plnenia', 'objednavky': 'Objednávka', 'verejne-obstaravanie': 'Verejné obstarávanie', 'vzn': 'Všeobecne záväzné nariadenie'}
FIELDS = {'datum_vystavenia': 'Dátum vystavenia', 'datum_splatnosti': 'Dátum splatnosti', 'datum_podpisu': 'Dátum podpisu', 'datum_ucinnosti': 'Účinnosť od', 'datum_objednania': 'Dátum objednania', 'termin_dodania': 'Termín dodania', 'datum_schvalenia': 'Dátum schválenia', 'lehota_predkladania': 'Lehota na predkladanie', 'cpv': 'Kód CPV', 'stav': 'Stav obstarávania', 'suma_bez_dph': 'Základ dane', 'suma_dph': 'DPH 23 %', 'suma_s_dph': 'Celkom s DPH', 'predpokladana_hodnota_bez_dph': 'Predpokladaná hodnota bez DPH'}


def generate_document(agenda, row, output):
    """Render a supplied API payload, including arbitrary invoice number, faithfully."""
    pdfmetrics.registerFont(TTFont('Liberation', str(FONT_ROOT / 'LiberationSans-Regular.ttf')))
    pdfmetrics.registerFont(TTFont('LiberationBold', str(FONT_ROOT / 'LiberationSans-Bold.ttf')))
    body = ParagraphStyle('body', fontName='Liberation', fontSize=10, leading=15, textColor=colors.HexColor('#26374a'))
    title = ParagraphStyle('title', parent=body, fontName='LiberationBold', fontSize=21, leading=27, spaceAfter=12)
    subtitle = ParagraphStyle('subtitle', parent=body, fontName='LiberationBold', fontSize=13, leading=19, spaceAfter=14)
    p = lambda text, style=body: Paragraph(escape(str(text)), style)
    story = [p('MESTSKÁ EVIDENCIA DOKUMENTOV'), Spacer(1, 19), p(LABELS[agenda], title), p(row['cislo'], subtitle), p(row.get('nazov', row['predmet']), subtitle)]
    if row.get('nazov') and row['predmet'] != row['nazov']:
        story.extend([p(row['predmet']), Spacer(1, 12)])
    parties = [('Vystavovateľ', 'Mesto Žilina')] if agenda == 'faktury' else [('Objednávateľ', 'Mesto Žilina')] if agenda != 'vzn' else []
    for key, label in [('odberatel', 'Odberateľ'), ('dodavatel', 'Dodávateľ'), ('zmluvna_strana', 'Zmluvná strana')]:
        if row.get(key): parties.append((label, row[key]['nazov']))
    values = [[p(label), p(value)] for label, value in parties]
    for key, label in FIELDS.items():
        if key in row:
            value = row[key]
            if key.startswith('suma') or key == 'predpokladana_hodnota_bez_dph': value += ' EUR'
            if key == 'stav': value = {'ukoncene': 'Ukončené', 'otvorene': 'Otvorené', 'zrusene': 'Zrušené'}.get(value, value)
            values.append([p(label), p(value)])
    table = Table(values, colWidths=[190, 300], hAlign='LEFT')
    table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP'), ('BOTTOMPADDING', (0,0),(-1,-1), 9), ('TOPPADDING', (0,0),(-1,-1), 7), ('LINEBELOW', (0,0),(-1,-1), .4, colors.HexColor('#dce2e8'))]))
    story.extend([Spacer(1, 8), table, Spacer(1, 22)])
    detail = {
        'faktury': 'Predmet vyúčtovania: ' + row['predmet'] + '. Platba prevodom do uvedeného dátumu splatnosti. Rozpis základu dane a DPH je uvedený vyššie.',
        'dodavatelske-faktury': 'Vyúčtovanie dohodnutého plnenia: ' + row['predmet'] + '. Dodávka sa vzťahuje na celý uvedený rozsah prác alebo služieb.',
        'zmluvy': 'Predmet dohody: ' + row['predmet'] + '. Cena zahŕňa dohodnuté práce, materiál a odovzdanie výsledku objednávateľovi. Konkrétny termín dodania upravuje nadväzujúca objednávka.',
        'objednavky': 'Objednávame: ' + row['predmet'] + '. Po dokončení žiadame odovzdanie výsledku zodpovednému pracovníkovi mesta a vystavenie vyúčtovania.',
        'verejne-obstaravanie': 'Rozsah zákazky: ' + row['predmet'] + '. Predpokladaná hodnota slúži na plánovanie obstarávania. Ponuka zahŕňa cenu, opis postupu a časový harmonogram plnenia.',
        'vzn': 'Článok 1 - Predmet úpravy. ' + row['predmet'] + ' Článok 2 - Vykonávanie. Informácie o praktickom postupe poskytuje príslušné pracovisko mestského úradu. Článok 3 - Účinnosť. Nariadenie sa v tejto ukážke uplatňuje od dátumu uvedeného vyššie.',
    }[agenda]
    story.append(p(detail))
    output = Path(output)
    output.parent.mkdir(parents=True, exist_ok=True)
    def footer(canvas, doc):
        canvas.setFont('Liberation', 8)
        canvas.setFillColor(colors.HexColor('#63758a'))
        canvas.drawString(48, 36, 'Fiktívny príklad pre demo OpenObec. Nejde o skutočný dokument mesta.                                                      1 / 1')
    doc = SimpleDocTemplate(str(output), pagesize=(595.28, 841.89), leftMargin=48, rightMargin=48, topMargin=48, bottomMargin=66, title=LABELS[agenda]+' '+row['cislo'], author='OpenObec', invariant=1, pdfVersion=(1,4))
    doc.build(story, onFirstPage=footer, onLaterPages=footer)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--agenda', choices=AGENDAS)
    parser.add_argument('--payload', type=Path)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    if args.agenda:
        if not args.payload or not args.output: parser.error('--agenda requires --payload and --output')
        generate_document(args.agenda, json.loads(args.payload.read_text()), args.output)
    else:
        for agenda in AGENDAS:
            for index in range(12): generate_document(agenda, catalog(agenda,index), document_path(agenda,index))

if __name__ == '__main__': main()
