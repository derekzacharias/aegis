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
