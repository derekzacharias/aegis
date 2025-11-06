#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const DEFAULT_BASE_URL = process.env.AEGIS_API_BASE_URL || 'http://localhost:3333/api';
const PACKAGE_JSON_PATH = path.join(__dirname, '..', '..', 'package.json');

let CLI_VERSION = 'unknown';
try {
  const rawPackage = fs.readFileSync(PACKAGE_JSON_PATH, 'utf8');
  const parsed = JSON.parse(rawPackage);
  if (parsed?.version) {
    CLI_VERSION = parsed.version;
  }
} catch {
  // fall through with unknown version
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) {
      continue;
    }

    const eqIndex = arg.indexOf('=');
    if (eqIndex > -1) {
      const key = arg.slice(2, eqIndex);
      const value = arg.slice(eqIndex + 1);
      result[key] = value;
      continue;
    }

    const key = arg.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      result[key] = next;
      index += 1;
    } else {
      result[key] = true;
    }
  }
  return result;
}

function getOption(options, key, fallback) {
  if (options[key] !== undefined) {
    return options[key];
  }
  return fallback;
}

function toBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'y', 'on'].includes(value.toLowerCase());
  }
  return Boolean(value);
}

function ensure(value, message) {
  if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
    throw new Error(message);
  }
  return value;
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function splitCsvLine(line) {
  const values = [];
  let buffer = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (insideQuotes && line[index + 1] === '"') {
        buffer += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === ',' && !insideQuotes) {
      values.push(buffer);
      buffer = '';
      continue;
    }

    buffer += char;
  }

  values.push(buffer);
  return values.map((value) => value.trim());
}

function toList(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : entry))
      .filter((entry) => typeof entry === 'string' && entry.length > 0);
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parts = trimmed
    .split('|')
    .map((entry) => entry.trim())
    .filter(Boolean);

  return parts.length ? parts : undefined;
}

function normalizePriority(value) {
  if (typeof value === 'string') {
    const normalized = value.trim().toUpperCase();
    if (['P0', 'P1', 'P2', 'P3'].includes(normalized)) {
      return normalized;
    }
  }
  return 'P2';
}

function normalizeKind(value) {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized.startsWith('enh')) {
      return 'enhancement';
    }
  }
  return 'base';
}

function normalizeBaselines(value) {
  const entries = toList(value);
  if (!entries) {
    return undefined;
  }
  const allowed = new Set(['low', 'moderate', 'high', 'privacy']);
  const baselines = entries
    .map((entry) => entry.toLowerCase())
    .filter((entry) => allowed.has(entry));

  return baselines.length ? baselines : undefined;
}

function parseMetadata(value, contextLabel) {
  if (!value) {
    return undefined;
  }

  if (isPlainObject(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (isPlainObject(parsed)) {
        return parsed;
      }
      throw new Error(`Metadata must be a JSON object in ${contextLabel}`);
    } catch (error) {
      throw new Error(`Unable to parse metadata JSON in ${contextLabel}: ${(error)?.message ?? error}`);
    }
  }

  throw new Error(`Unsupported metadata value in ${contextLabel}; expected object or JSON string.`);
}

function normalizeControl(raw, index) {
  const label = `controls[${index}]`;
  const family = ensure(raw.family, `${label}.family is required`).trim();
  const title = ensure(raw.title, `${label}.title is required`).trim();
  const description = ensure(raw.description, `${label}.description is required`).trim();
  const priority = normalizePriority(raw.priority);
  const kind = normalizeKind(raw.kind);
  const baselines = normalizeBaselines(raw.baselines);
  const keywords = toList(raw.keywords);
  const references = toList(raw.references);
  const tags = toList(raw.tags);
  const relatedControls = toList(raw.relatedControls);

  const control = {
    family,
    title,
    description,
    priority,
    kind
  };

  if (raw.parentId) {
    control.parentId = String(raw.parentId).trim();
  }

  if (baselines) {
    control.baselines = baselines;
  }
  if (keywords) {
    control.keywords = keywords;
  }
  if (references) {
    control.references = references;
  }
  if (relatedControls) {
    control.relatedControls = relatedControls;
  }
  if (tags) {
    control.tags = tags;
  }

  const metadata = parseMetadata(raw.metadata, `${label}.metadata`);
  if (metadata) {
    control.metadata = metadata;
  }

  return control;
}

function parseJsonControls(content, filePath) {
  let data;
  try {
    data = JSON.parse(content);
  } catch (error) {
    throw new Error(`Unable to parse JSON controls from ${filePath}: ${(error)?.message ?? error}`);
  }

  if (!Array.isArray(data)) {
    throw new Error(`JSON input in ${filePath} must be an array of control objects.`);
  }

  return data.map((entry, index) => normalizeControl(entry, index));
}

function parseCsvControls(content, filePath) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (!lines.length) {
    return [];
  }

  const headers = splitCsvLine(lines.shift());
  if (!headers.length) {
    throw new Error(`CSV header row is empty in ${filePath}`);
  }

  const records = [];

  lines.forEach((line) => {
    const values = splitCsvLine(line);
    if (values.length === 1 && !values[0]) {
      return;
    }

    while (values.length < headers.length) {
      values.push('');
    }

    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? '';
    });
    records.push(record);
  });

  return records.map((record, index) =>
    normalizeControl(
      {
        family: record.family,
        title: record.title,
        description: record.description,
        priority: record.priority,
        kind: record.kind,
        baselines: record.baselines,
        keywords: record.keywords,
        references: record.references,
        tags: record.tags,
        metadata: parseMetadata(record.metadata, `csv row ${index + 2}`),
        parentId: record.parentId,
        relatedControls: record.relatedControls
      },
      index
    )
  );
}

function parseControlsFromFile(filePath) {
  const absolutePath = path.resolve(filePath);
  const ext = path.extname(absolutePath).toLowerCase();
  const content = fs.readFileSync(absolutePath, 'utf8');

  if (ext === '.json') {
    return parseJsonControls(content, absolutePath);
  }

  if (ext === '.csv') {
    return parseCsvControls(content, absolutePath);
  }

  throw new Error(`Unsupported input format for ${filePath}. Provide a .csv or .json file.`);
}

function pruneEmpty(value) {
  if (Array.isArray(value)) {
    const filtered = value
      .map((entry) => pruneEmpty(entry))
      .filter((entry) => entry !== undefined && entry !== null);
    return filtered.length ? filtered : undefined;
  }

  if (isPlainObject(value)) {
    const result = {};
    for (const [key, entry] of Object.entries(value)) {
      const pruned = pruneEmpty(entry);
      const shouldKeep =
        pruned !== undefined &&
        pruned !== null &&
        !(Array.isArray(pruned) && pruned.length === 0) &&
        !(isPlainObject(pruned) && Object.keys(pruned).length === 0);
      if (shouldKeep) {
        result[key] = pruned;
      }
    }
    return Object.keys(result).length ? result : undefined;
  }

  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return value;
}

function buildMetadata(user, options, controlsCount, inputPath) {
  const runId = getOption(options, 'run-id', `cli-${Date.now()}`);
  const sourceType = getOption(options, 'source-type', 'agent-cli');
  const sourceId = getOption(options, 'source-id');
  const sourceLabel = getOption(options, 'source-label');
  const resolvedPath = path.resolve(inputPath);

  const metadata = {
    owner: {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId
    },
    source: {
      type: sourceType,
      identifier: sourceId,
      label: sourceLabel,
      runId,
      cliVersion: CLI_VERSION,
      inputFile: path.basename(resolvedPath)
    },
    importRun: {
      runId,
      file: resolvedPath,
      controlCount: controlsCount,
      importedAt: new Date().toISOString()
    }
  };

  return pruneEmpty(metadata);
}

function formatAxiosError(error) {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    const detail =
      typeof data === 'string'
        ? data
        : JSON.stringify(data, null, 2);
    return `Request failed (${status}): ${detail}`;
  }

  if (error.request) {
    return `No response received: ${error.message}`;
  }

  return error.message;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const inputPath = getOption(options, 'input') || getOption(options, 'file');
  ensure(inputPath, 'Specify an input file with --input <path-to-csv-or-json>.');

  const name = getOption(options, 'name');
  const version = getOption(options, 'version');
  const description = getOption(options, 'description') || '';
  const familyOption = getOption(options, 'family', process.env.AEGIS_FRAMEWORK_FAMILY);
  const family = familyOption ? String(familyOption).toUpperCase() : null;
  const publish = toBoolean(getOption(options, 'publish', false));

  const baseUrl = (getOption(options, 'base-url', DEFAULT_BASE_URL) || DEFAULT_BASE_URL).replace(
    /\/$/,
    ''
  );

  console.log(`[framework-seed] Base URL: ${baseUrl}`);
  console.log(`[framework-seed] Reading controls from ${inputPath}`);

  const controls = parseControlsFromFile(inputPath);
  console.log(`[framework-seed] Parsed ${controls.length} controls`);

  let accessToken =
    getOption(options, 'token') ||
    process.env.AEGIS_API_TOKEN ||
    null;

  const apiClient = axios.create({
    baseURL: baseUrl,
    timeout: 15000
  });

  let authUser;

  if (!accessToken) {
    const email = getOption(options, 'email') || process.env.AEGIS_API_EMAIL;
    const password = getOption(options, 'password') || process.env.AEGIS_API_PASSWORD;
    ensure(email, 'Provide --email or set AEGIS_API_EMAIL when no token is supplied.');
    ensure(password, 'Provide --password or set AEGIS_API_PASSWORD when no token is supplied.');

    console.log('[framework-seed] Authenticating and requesting access token');
    const { data } = await apiClient.post('/auth/login', {
      email,
      password
    });
    accessToken = data.tokens.accessToken;
    authUser = data.user;
  }

  apiClient.defaults.headers.common['Authorization'] = `Bearer ${ensure(
    accessToken,
    'Unable to determine access token for API calls.'
  )}`;

  if (!authUser) {
    const { data } = await apiClient.get('/auth/me');
    authUser = data;
  }

  const metadata = buildMetadata(authUser, options, controls.length, inputPath);

  ensure(name, 'Framework name is required (use --name).');
  ensure(version, 'Framework version is required (use --version).');

  let frameworkId = null;
  let frameworkSummary = null;

  console.log('[framework-seed] Fetching existing frameworks');
  const { data: frameworks } = await apiClient.get('/frameworks');
  const existing = Array.isArray(frameworks)
    ? frameworks.find(
        (framework) =>
          framework.isCustom && framework.name === name && framework.version === version
      )
    : undefined;

  if (existing) {
    frameworkId = existing.id;
    frameworkSummary = existing;
    console.log(
      `[framework-seed] Updating existing framework ${existing.id} (${existing.name} v${existing.version})`
    );
    await apiClient.patch(`/frameworks/${frameworkId}`, {
      ...(description ? { description } : {}),
      ...(family ? { family } : {}),
      metadata
    });
  } else {
    ensure(description, 'Framework description is required for new frameworks (use --description).');
    console.log('[framework-seed] Creating new draft framework');
    const { data } = await apiClient.post('/frameworks', {
      name,
      version,
      description,
      family: family ?? 'CUSTOM',
      metadata
    });
    frameworkId = data.id;
    frameworkSummary = data;
    console.log(`[framework-seed] Created framework ${frameworkId}`);
  }

  ensure(frameworkId, 'Unable to determine framework identifier.');

  if (controls.length) {
    console.log('[framework-seed] Uploading controls to framework');
    await apiClient.put(`/frameworks/${frameworkId}/controls`, {
      controls
    });
  } else {
    console.log('[framework-seed] No controls supplied; skipping control import.');
  }

  if (publish) {
    console.log('[framework-seed] Publishing framework');
    const publishMetadata = pruneEmpty({
      ...metadata,
      importRun: {
        ...(metadata.importRun ?? {}),
        publishedAt: new Date().toISOString()
      }
    });
    await apiClient.post(`/frameworks/${frameworkId}/publish`, {
      metadata: publishMetadata
    });
    console.log(`[framework-seed] Framework ${frameworkId} published successfully.`);
  } else {
    console.log(
      '[framework-seed] Framework remains in draft status. Re-run with --publish to promote.'
    );
  }

  console.log('[framework-seed] Done.');
  return {
    frameworkId,
    frameworkSummary
  };
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    const message = error?.isAxiosError ? formatAxiosError(error) : error?.message ?? error;
    console.error(`[framework-seed] Failed: ${message}`);
    process.exit(1);
  });
