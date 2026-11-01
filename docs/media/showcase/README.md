# Actual local publication recording for GitHub

Recorded 2026-11-01 from the functioning OpenObec local office and citizen applications (UI base e20f6d0). No generated video, mock response, external embed, fabricated success, or cuts: continuous real UI capture at 1280×800, 25 fps. Google Chrome / Playwright 1.64.1 with its official FFmpeg 1013 VP9 encoder. Silent WebM, 39.24 s, 3,458,209 bytes; poster is the original filled-form stage converted to JPEG, not a redesigned screen. Slovak VTT accompanies the retained video. The user moved this recording to GitHub/documentation: the homepage now shows three real screenshots and gentle transitions, with no video element, download or preload.

Retained exclusively owned invoice: `FV/2026/0057`, “Prenájom sály na komunitné podujatie”, customer “Spolok Rodinná lúka”; dates 2026-11-02 / 2026-12-02; exact monetary strings 245.50 + 56.47 = 301.97 EUR. All people/organizations/documents are fictional examples. Source and public id: `fak_d0f2b5d6-7a8a-422e-a71f-c5698c32aae4`. Public local detail: http://127.0.0.1:3001/obcan/faktury/fak_d0f2b5d6-7a8a-422e-a71f-c5698c32aae4 . Source upload, public UI download, and authored PDF all SHA-256 `472a316ee2868bd85f50e2fe329dfc447bb840702fe9992af45073060824b149`.

Proof, source/public snapshots, matching one-page PDF, ownership and eight representative frames: `docs/reviews/2026-11-01-portal-refinement/showcase/2026-11-01T19-36-37-574Z/`. Actual metadata and native playback screenshot are alongside. This invoice stays published because the provenance links to it. No incumbent seed/user record was edited; in particular the user-edited 0052 was preserved. Earlier exclusively owned recording attempts 0053, 0054, 0055, 0056 were verified by id and payload and soft-deleted; compact history is in `showcase/attempts.json`, large failed captures remain only in ignored `.run/showcase-attempts/`. Their numbers remain reserved by the source service, so reruns skip them.

## Reproduce

With the local stack ready (office 3002, citizen 3001, gateway 8080) and Node/pnpm dependencies installed:

```sh
pnpm exec playwright install ffmpeg
node /Users/simonochotnicky/.codex/plugins/cache/openai-primary-runtime/pdf/26.1026.10807/skills/pdf/container_tools/mark_artifact_operation_started.mjs --operation-kind create --expected-output-count 1 --output-format pdf
node scripts/showcase/record.mjs
```

The PDF authoring command uses bundled Python/ReportLab and Liberation fonts from the existing PDF generator. Override `PDF_PYTHON` and `OPENOBEC_PDF_FONTS` when that runtime is elsewhere; set `CHROME_PATH` for a different installed Chrome. macOS `sips` converts the unedited stage capture to the poster. `SHOWCASE_OUTPUT` can direct the three media assets to a review directory; the default is `docs/media/showcase`. The recording script creates a fresh number, writes ownership before/after creation, records real clicks and upload/publication/search, validates source/public ids, exact payload fields and all three PDF hashes, and produces video, poster and timed captions. It never updates or deletes an existing record. Stop on any conflict or proof failure, inspect the owned manifest and preserve all other records. A new successful recording intentionally adds one demo record; clean up older owned recordings only after checking exact identity/payload/file proof. Review media, captions and provenance together before replacing the shipped assets.

The installed older FFmpeg 1011 was insufficient: Playwright 1.64 records VP9. Use the matching official installer, not an alias to a VP8-only encoder. The default-cache installer may remove older unused Playwright browsers; use `PLAYWRIGHT_SKIP_BROWSER_GC=1` or a task-local `PLAYWRIGHT_BROWSERS_PATH` when preserving those caches matters.

The homepage PNG sequence remains the approved 0057 capture and is not replaced automatically on a new video run. Update those selected real captures and their provenance together only when intentionally refreshing the homepage story.
