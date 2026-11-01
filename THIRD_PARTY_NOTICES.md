# Third-party notices

The root [MIT license](LICENSE) covers OpenObec's original contributions. It does not replace the licenses of dependencies, container images, fonts or copied upstream components. This focused inventory records bundled material; it is not an exhaustive license list for every transitive dependency.

| Material | Upstream / provenance | Retained license |
|---|---|---|
| Geist fonts used by the UI | [Vercel / Geist](https://github.com/vercel/geist-font); © 2023 Vercel, with basement.studio | [SIL OFL 1.1](packages/ui/LICENSES/Geist-OFL.txt) |
| Lucide icons | [Lucide](https://github.com/lucide-icons/lucide); copyright holders and Feather attribution are retained in the license | [ISC](packages/ui/LICENSES/Lucide-ISC.txt) |
| Generated/adapted shadcn/ui components | [shadcn/ui](https://github.com/shadcn-ui/ui); © 2023 shadcn. Notice copied verbatim from installed `shadcn` 4.23.0 `LICENSE.md` | [MIT](packages/ui/LICENSES/shadcn-MIT.txt) |
| Liberation font embedded in authored demo PDFs | [Liberation Fonts](https://github.com/liberationfonts/liberation-fonts); digitized data © 2010 Google Corporation, © 2012 Red Hat, Inc. Notice copied verbatim from `pdfjs-dist/standard_fonts/LICENSE_LIBERATION` distributed with the PDF-authoring runtime | [SIL OFL 1.1, including reserved font names](scripts/seed/documents/Liberation-OFL.txt) |

The Liberation license applies to the embedded font software; its terms distinguish font software from documents created with it. No standalone font binaries were added for this notice.

The interface uses the IDSK3 color palette as documented in [DESIGN.md](DESIGN.md); the components and typography are shadcn/ui and Geist. Demo records and screenshots are fictional examples, with media provenance alongside the [screenshots](apps/marketing/public/previews/README.md) and [recording](docs/media/showcase/README.md).

For other dependencies consult the manifests and lockfiles (`package.json`, `pnpm-lock.yaml`, Maven `pom.xml` files), their distributed license notices, and the images referenced by `compose.yaml` / `compose.apps.yaml`. Do not assume MongoDB, Kafka, RustFS or their images share the project's MIT license.
