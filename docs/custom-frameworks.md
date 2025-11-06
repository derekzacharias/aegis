# Custom Framework Workflow

This guide covers how to create and publish organisation-specific frameworks using the API and web wizard.

## API endpoints

All framework routes are namespaced under `/frameworks` and require authentication. The new endpoints are:

- `POST /frameworks` – create a draft framework.
- `PATCH /frameworks/:frameworkId` – update draft metadata.
- `PUT /frameworks/:frameworkId/controls` – replace the draft control set.
- `POST /frameworks/:frameworkId/publish` – publish the framework once controls are in place.
- `GET /frameworks/:frameworkId` – fetch detailed framework information (including controls).
- `GET /frameworks/:frameworkId/controls` – fetch control catalog data with facets, assessments, evidence, and mappings.

All create/update endpoints are organisation-scoped and restricted to analyst/admin roles. Controls and control metadata (keywords, baselines, tags, mappings) are persisted as part of the Prisma model.

### Validation

- Framework names must be unique per organisation.
- Controls require family, title, description, and priority.
- Publish requires at least one control.
- Publish metadata must include the acting owner (`metadata.owner.userId`) and source details (`metadata.source.type`). The CLI and wizard populate these fields automatically.
- Control mappings support optional tags, confidence, and rationale.

### CSV/JSON imports

`PUT /frameworks/:frameworkId/controls` accepts the same shape as the web wizard import:

```csv
family,title,description,priority,kind,baselines,keywords,references,tags
Access Management,User MFA,Require MFA for privileged access,P1,base,high|moderate,MFA,SP800-63,,
```

```json
[
  {
    "family": "Audit",
    "title": "Log retention",
    "description": "Retain audit logs for 1 year",
    "priority": "P2",
    "kind": "base",
    "baselines": ["moderate"],
    "keywords": ["logging"],
    "references": ["nist-800-53"]
  }
]
```

### CLI seeding script

Automation agents (or local operators) can seed frameworks end-to-end with the helper script at `tools/scripts/seed-framework.js`. The script handles authentication, creates or updates the framework, uploads controls from CSV/JSON, and optionally publishes the framework with the required metadata.

```bash
# optional: configure defaults for the CLI
export AEGIS_API_BASE_URL="http://localhost:3333/api"
export AEGIS_API_TOKEN="<access token from /auth/login>"

node tools/scripts/seed-framework.js \
  --input tools/scripts/examples/sample-controls.csv \
  --name "Automation Baseline" \
  --version "2024.1" \
  --description "Baseline imported via CLI" \
  --publish
```

Key flags:

- `--input` – required path to a `.csv` or `.json` control file (templates live under `tools/scripts/examples/`).
- `--name`, `--version`, `--description` – identify the framework draft; description is required when creating a new framework.
- `--email/--password` or `--token` – authenticate the CLI. When a token is supplied, the script resolves the authenticated user via `/auth/me`.
- `--publish` – promote the framework after controls upload. Published frameworks must include ownership metadata; the script automatically records the acting user and source in `metadata.owner` / `metadata.source`.
- `--source-type`, `--source-id`, `--run-id` – optional knobs for annotating the metadata for traceability (defaults to `agent-cli` and a generated run identifier).

The script merges metadata with any existing values so manual edits (for example, wizard progress) are preserved. Each run records `metadata.importRun` details (file path, control count, timestamps) that satisfy the new publish validation guardrails.

## Web wizard

Open the Framework Library and choose **Add Custom Framework** (or resume an existing draft). The wizard runs through four steps:

1. **Details** – name, version, description, family. Saving creates or updates the draft (status `DRAFT`).
2. **Controls** – add controls manually or import CSV/JSON. Controls can be edited or removed before saving.
3. **Review** – verify framework metadata and control list.
4. **Publish** – final confirmation. Publishing updates status to `PUBLISHED` and timestamps `publishedAt`.

Draft frameworks persist across sessions and appear in the library with a `Draft` badge. Publishing makes the framework visible in the control catalog, crosswalk explorer, and assessment module. Permissions are enforced so only administrators and analysts can create/edit/publish.

## Integration highlights

- Control catalog facets now include custom frameworks and expose control metadata, assessments, evidence links, and crosswalk mappings.
- Crosswalk generation respects organisation scoping and can target custom frameworks once published.
- Assessments use framework control metadata (including tags/baselines) and automatically pick up published frameworks.

## Testing

- API: `npx jest --runInBand apps/api/src/framework/framework.service.spec.ts --config apps/api/jest.config.ts`
- Web: `npx jest --runInBand --config apps/web/jest.config.ts`

The full API test suite requires binding to a local port. In sandboxed environments lacking socket permissions, run the targeted framework service spec instead.
