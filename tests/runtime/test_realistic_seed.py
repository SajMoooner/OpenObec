"""Catalog invariants: readable evidence, exact money and coherent linked work."""
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
import sys
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'scripts/seed'))
from realistic import catalog, document_path
from seed import AGENDAS

class RealisticCatalog(unittest.TestCase):
    def test_all_agendas_have_varied_human_records_and_committed_pdf(self):
        for agenda in AGENDAS:
            rows = [catalog(agenda, i) for i in range(12)]
            self.assertEqual(12, len({r['cislo'] for r in rows}))
            self.assertEqual(12, len({r.get('nazov', r['predmet']) for r in rows}))
            self.assertEqual(8, sum(r['zverejnene'] for r in rows))
            for i, row in enumerate(rows):
                self.assertNotRegex(str(row).lower(), 'demo|syntet|900000')
                self.assertTrue(document_path(agenda, i).read_bytes().startswith(b'%PDF-1.4'))
            if agenda != 'vzn':
                key = 'predpokladana_hodnota_bez_dph' if agenda == 'verejne-obstaravanie' else 'suma_s_dph'
                self.assertGreater(len({r[key] for r in rows}), 8)

    def test_exact_money_dates_and_scenarios(self):
        for agenda in ('faktury', 'dodavatelske-faktury'):
            for i in range(12):
                r = catalog(agenda, i)
                self.assertEqual(Decimal(r['suma_dph']), (Decimal(r['suma_bez_dph']) * Decimal('.23')).quantize(Decimal('.01'), rounding=ROUND_HALF_UP))
                self.assertEqual(Decimal(r['suma_s_dph']), Decimal(r['suma_bez_dph']) + Decimal(r['suma_dph']))
                self.assertLess(r['datum_vystavenia'], r['datum_splatnosti'])
        for i, word in enumerate(('knižnice', 'stromov')):
            for agenda in AGENDAS[:-1]:
                row = catalog(agenda, i)
                self.assertIn(word, row['predmet'])
                self.assertTrue(row['zverejnene'])
            for agenda in ('zmluvy', 'objednavky', 'dodavatelske-faktury'):
                row = catalog(agenda, i)
                party = row.get('zmluvna_strana', row.get('dodavatel'))
                self.assertEqual(catalog('dodavatelske-faktury', i)['dodavatel'], party)
        self.assertIn('osvetlenia', catalog('zmluvy', 2)['predmet'])
        self.assertIn('osvetlenia', catalog('zmluvy', 3)['predmet'])
        for i in range(12):
            contract, order, invoice = (catalog(a,i) for a in ('zmluvy','objednavky','dodavatelske-faktury'))
            self.assertLess(contract['datum_podpisu'], contract['datum_ucinnosti'])
            self.assertLess(contract['datum_ucinnosti'], order['datum_objednania'])
            self.assertLess(order['datum_objednania'], order['termin_dodania'])
            self.assertLess(order['termin_dodania'], invoice['datum_vystavenia'])
            tender=catalog('verejne-obstaravanie',i)
            if tender['stav']=='otvorene':
                self.assertGreater(tender['lehota_predkladania'], '2026-11-01')
                self.assertIn('2027', tender['predmet'])
            else:
                self.assertLess(tender['lehota_predkladania'], contract['datum_podpisu'])

if __name__ == '__main__': unittest.main()
