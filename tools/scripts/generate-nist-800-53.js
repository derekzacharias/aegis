const fs = require('fs');
const path = require('path');

const catalogDir = path.join(__dirname, '..', '..', 'tmp', 'oscal-content', 'nist.gov', 'SP800-53', 'rev5', 'json');
const catalogPath = path.join(catalogDir, 'NIST_SP-800-53_rev5_catalog.json');
const baselineFiles = {
  low: 'NIST_SP-800-53_rev5_LOW-baseline-resolved-profile_catalog.json',
  moderate: 'NIST_SP-800-53_rev5_MODERATE-baseline-resolved-profile_catalog.json',
  high: 'NIST_SP-800-53_rev5_HIGH-baseline-resolved-profile_catalog.json',
  privacy: 'NIST_SP-800-53_rev5_PRIVACY-baseline-resolved-profile_catalog.json'
};

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function extractControls(catalog) {
  const entries = [];

  function walkGroups(groups, family) {
    if (!groups) return;
    for (const group of groups) {
      const familyTitle = group.title || family || 'NIST SP 800-53';
      if (Array.isArray(group.controls)) {
        for (const control of group.controls) {
          if (!control?.id) continue;
          const isEnhancement = control.id.includes('.');
          if (!isEnhancement) {
            entries.push({ control, family: familyTitle, kind: 'base', parentId: undefined });
            if (Array.isArray(control.controls)) {
              for (const enhancement of control.controls) {
                if (!enhancement?.id) continue;
                entries.push({
                  control: enhancement,
                  family: familyTitle,
                  kind: 'enhancement',
                  parentId: control.id
                });
              }
            }
          } else {
            // Some catalogs may inline enhancements at the same level
            entries.push({ control, family: familyTitle, kind: 'enhancement', parentId: control.id.split('.')[0] });
          }
        }
      }
      if (Array.isArray(group.groups)) {
        walkGroups(group.groups, familyTitle);
      }
    }
  }

  walkGroups(catalog.catalog?.groups || [], null);
  return entries;
}

function resolveParamLabel(param) {
  if (!param) return undefined;
  if (param.label && !/^AC-/i.test(param.label)) {
    return param.label;
  }

  if (Array.isArray(param.guidelines) && param.guidelines.length > 0) {
    const prose = param.guidelines[0]?.prose;
    if (prose) {
      return prose.replace(/is\/are defined;?$/i, '').trim();
    }
  }

  if (param.select?.choice) {
    return `choose: ${param.select.choice.join(', ')}`;
  }

  const altId = param.props?.find((prop) => prop.name === 'alt-identifier')?.value;
  if (altId) {
    return altId.replace(/_/g, '-');
  }

  const labelProp = param.props?.find((prop) => prop.name === 'label');
  if (labelProp?.value) {
    return labelProp.value;
  }

  return param.id;
}

function renderProse(text, paramMap) {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\{\{\s*insert:\s*param,\s*([^}\s]+)\s*\}\}/gi, (_, paramId) => {
      const label = paramMap.get(paramId);
      return label ? `[${label}]` : `[${paramId}]`;
    });
}

function extractDescription(control) {
  if (!Array.isArray(control.parts)) {
    return control.title || control.id;
  }
  const paramMap = new Map();
  if (Array.isArray(control.params)) {
    for (const param of control.params) {
      const label = resolveParamLabel(param);
      if (label) {
        paramMap.set(param.id, label);
      }
    }
  }

  function gather(part) {
    const segments = [];
    if (part.prose) {
      segments.push(renderProse(part.prose, paramMap));
    }
    if (Array.isArray(part.parts)) {
      for (const child of part.parts) {
        segments.push(...gather(child));
      }
    }
    return segments.filter(Boolean);
  }

  const statementPart = control.parts.find((part) => part.name === 'statement');
  if (!statementPart) {
    return control.title || control.id;
  }
  const segments = gather(statementPart);
  const description = segments.join(' ');
  return description || control.title || control.id;
}

function collectBaselines() {
  const result = new Map();
  for (const [baseline, file] of Object.entries(baselineFiles)) {
    const filePath = path.join(catalogDir, file);
    if (!fs.existsSync(filePath)) continue;
    const catalog = loadJson(filePath);
    for (const entry of extractControls(catalog)) {
      const set = result.get(entry.control.id) ?? new Set();
      set.add(baseline);
      result.set(entry.control.id, set);
    }
  }
  return result;
}

function derivePriority(baselines) {
  if (baselines.includes('high')) return 'P0';
  if (baselines.includes('moderate')) return 'P1';
  if (baselines.includes('low')) return 'P2';
  if (baselines.includes('privacy')) return 'P1';
  return 'P3';
}

function buildCatalog() {
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Missing catalog at ${catalogPath}`);
  }
  const catalog = loadJson(catalogPath);
  const baselineSets = collectBaselines();

  const entries = extractControls(catalog).map(({ control, family, kind, parentId }) => {
    const baselines = baselineSets.get(control.id)
      ? Array.from(baselineSets.get(control.id)).sort((a, b) => a.localeCompare(b))
      : [];
    const priority = derivePriority(baselines);
    const relatedControls = Array.isArray(control.links)
      ? control.links
          .filter((link) => link.rel === 'related' && typeof link.href === 'string')
          .map((link) => link.href.replace(/^#/, ''))
      : [];
    const references = Array.isArray(control.links)
      ? control.links
          .filter((link) => link.rel === 'reference' && typeof link.href === 'string')
          .map((link) => link.href.replace(/^#/, ''))
      : [];

    return {
      id: control.id,
      frameworkId: 'nist-800-53-rev5',
      kind,
      parentId,
      family: family || 'NIST SP 800-53',
      title: control.title || control.id,
      description: extractDescription(control),
      priority,
      baselines: baselines.length ? baselines : undefined,
      references: references.length ? references : undefined,
      relatedControls: relatedControls.length ? relatedControls : undefined
    };
  });

  const sorted = entries.sort((a, b) => a.id.localeCompare(b.id));
  return sorted;
}

function writeOutput(data) {
  const targetPath = path.join(__dirname, '..', '..', 'apps', 'api', 'src', 'framework', 'seed', 'nist-800-53-controls.ts');
  const header = "import { ControlDefinition } from '../framework.types';\n\n";
  const body = `export const nist80053Rev5Controls: ControlDefinition[] = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(targetPath, header + body);
  console.log(`Wrote ${data.length} controls to ${targetPath}`);
}

function main() {
  const data = buildCatalog();
  writeOutput(data);
}

main();
