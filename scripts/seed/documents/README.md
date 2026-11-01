# Fictional municipal document fixtures

72 deterministic one-page PDF 1.4 files (12 per agenda), generated from `../realistic.py` by `../generate_pdfs.py`. These are authored examples, not scraped or official records. Organization names are fictional; no personal data, real supplier identifiers, signatures or seals are included. Each page carries a small fictional-example footer. The application's global demo disclosure remains in place.

Catalog version: `realistic-2026-v1`. Source titles, parties, dates and decimal-string amounts match the PDFs. First two contracts link four records each: library refurbishment and park tree planting. Issued invoices reimburse a contribution; supplier invoices pay the contractor. Other issued invoices describe municipal income. Open late-year procurement calls concern a new phase in 2027, distinct from earlier work.

Generation is a development step only. Ordinary seed/startup reads these committed bytes using Python's standard library. Generator uses ReportLab and embeds Liberation Sans (regular and bold), distributed with the Codex bundled runtime/pdfjs-dist; set `OPENOBEC_PDF_FONTS` to another directory containing `LiberationSans-Regular.ttf` and `LiberationSans-Bold.ttf` if needed. ReportLab invariant mode makes regeneration stable.

```sh
/Users/simonochotnicky/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/seed/generate_pdfs.py
```

For a new showcase invoice, supply the actual new invoice payload and unused number; do not reuse a seed PDF whose number differs:

```sh
python3 scripts/seed/generate_pdfs.py --agenda faktury --payload /tmp/showcase-invoice.json --output /tmp/showcase-invoice.pdf
```

The same renderer is importable as `generate_document(agenda, payload, output_path)`. This command needs the development PDF dependencies. It does not write to the API or alter the catalog. Visual verification: render with Poppler; inspect invoice, procurement and VZN. Check all PDFs are one page and Unicode text extracts correctly with pypdf.
