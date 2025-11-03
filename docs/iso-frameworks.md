# ISO/IEC 27001 & 27002 Support

The platform now ships Annex A control catalogs for ISO/IEC 27001:2022 and ISO/IEC 27002:2022. This section documents the import pipeline, data provenance, and validation steps for the seeds.

## Source Material & Normalisation

- Titles, clause numbers, and control themes are derived from ISO/IEC 27001:2022 Annex A and the companion ISO/IEC 27002:2022 guidance.
  - Control identifiers follow `iso-27xxx-2022-a-x-y` so clause numbering is preserved.
  - `metadata.clause` stores the human-readable clause (for example `A.5.1`) so APIs and the UI surface canonical numbering.
  - `metadata.domain` maps to the 2022 control groupings (`Organizational`, `People`, `Physical`, `Technological`).
- Descriptions are concise paraphrases of the normative text and highlight implementation intent while avoiding verbatim excerpts.

## Seeding Process

1. The Prisma seed (`apps/api/src/framework/seed/iso-270-controls.ts`) contains a single source of truth for all 93 controls. Two projections are emitted:
   - `iso27001Controls` for Annex A requirements.
   - `iso27002Controls` with matching identifiers and enriched guidance metadata.
2. The framework seed registers both catalogs (`iso-27001-2022`, `iso-27002-2022`) with family `ISO` and a control count of 93 so the API publishes the frameworks on first run.
3. Control seeds push metadata—including clause numbers, domains, tags, and keywords—into the fixtures so downstream services receive hydrated catalog entries.
4. Crosswalk seeds create a 1:1 mapping between ISO/IEC 27001 and ISO/IEC 27002 controls with a confidence score of `0.98`, making implementation guidance immediately available in the crosswalk explorer.

To apply the seeds locally:

```bash
npm run prisma:seed
```

## Validation Checklist

- **Clause coverage** – Verified that `ISO_CONTROL_COUNT` equals 93 and that every clause from A.5 through A.8 appears in both catalogs.
- **Crosswalk integrity** – Confirmed each ISO/IEC 27001 control maps to exactly one ISO/IEC 27002 control with identical clause metadata.
- **API tests** – Added unit tests to assert that crosswalk responses surface clause metadata and the framework list includes the ISO entries.
- **Frontend tests** – Extended UI tests to ensure ISO frameworks render in the library, appear in the assessment creation flow, and expose clause identifiers in catalog and crosswalk views.

## Usage Notes

- The control catalog recognises clause numbers during search (for example searching `A.5.1` matches ISO controls).
- Crosswalk responses expose clause metadata so analysts can pivot between the requirement (27001) and implementation guidance (27002) without leaving the explorer.
- Both frameworks participate in assessments just like existing catalogs; simply select the ISO frameworks when launching a new assessment.
