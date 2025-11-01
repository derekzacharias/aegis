# Control Crosswalk Engine

The crosswalk engine links controls across compliance frameworks and captures
evidence that can be re-used in future assessments. It is composed of three
main pieces:

- **Data model** – `ControlMapping` now stores `tags`, `origin`, and related
  evidence hints (`ControlMappingEvidenceHint`). Evidence hints optionally
  point to `EvidenceItem` records so analysts can jump straight to reusable
  artefacts.
- **Inference service** – `CrosswalkService` (NestJS) combines seeded mappings
  with cosine-similarity suggestions derived from control titles and
  descriptions. The API exposes `GET /api/frameworks/:id/crosswalk` for curated
  + suggested mappings and `POST /api/frameworks/:id/crosswalk` to capture
  manual overrides.
- **Experience surfaces** – Web UI surfaces crosswalk suggestions, filters by
  target framework / confidence, enables manual curation, and exposes evidence
  reuse recommendations inside the assessments view.

## How similarity works

We tokenise control metadata (ID, title, family, description) using a
stop-word filtered bag-of-words model. Term frequency vectors are compared via
cosine similarity. Suggestions are emitted when similarity exceeds a
confidence floor (default `0.35`). Each source control is limited to three
suggestions and we de-duplicate against stored mappings.

**Limitations:**

- No semantic embeddings yet; synonyms or contextual nuance can be missed.
- We do not currently weight fields (ID vs. description) or normalise by
  framework importance.
- Evidence hints without a linked `EvidenceItem` are surfaced as guidance only
  – analysts must attach supporting artefacts manually.
- Suggestions are generated per-request; we are not persisting them or
  tracking analyst feedback yet.

## Evidence reuse recommendations

`GET /api/assessments/:id/evidence-reuse` gathers all seeded/manual mappings
that reference organisation-owned evidence. The frontend modal highlights
recommended artefacts, mapped controls, confidence, and hint rationales so
teams can quickly re-use existing uploads during assessments.

Future enhancements could include:

1. Embedding-based similarity using OpenAI or local models.
2. Analyst feedback loops that adjust confidence or suppress suggestions.
3. Scoring evidence reuse candidates based on freshness or approval status.
