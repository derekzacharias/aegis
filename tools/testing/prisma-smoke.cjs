#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const schemaPath = 'apps/api/prisma/schema.prisma';

const logsRoot = path.join(process.cwd(), 'logs', 'prisma-smoke');
fs.mkdirSync(logsRoot, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const runDir = path.join(logsRoot, stamp);
fs.mkdirSync(runDir, { recursive: true });

const latestLink = path.join(logsRoot, 'latest');
try {
  fs.rmSync(latestLink, { recursive: true, force: true });
  fs.symlinkSync(runDir, latestLink, 'dir');
} catch {
  // Symlink creation is best effort; ignore failures (e.g., on Windows agents).
}

const logPaths = {
  summary: path.join(runDir, 'summary.log'),
  generate: path.join(runDir, 'prisma:generate.log'),
  migrate: path.join(runDir, 'db:migrate.log'),
  seed: path.join(runDir, 'prisma-seed.log')
};

const writeLog = (file, data) => {
  if (!data) {
    return;
  }
  fs.appendFileSync(file, data);
};

const metadataPath = path.join(runDir, 'metadata.json');
const metadata = {
  timestamp: new Date().toISOString(),
  schemaPath,
  databaseUrl: process.env.DATABASE_URL ?? null,
  status: 'running',
  commands: [],
  logs: {
    generate: path.relative(process.cwd(), logPaths.generate),
    migrate: path.relative(process.cwd(), logPaths.migrate),
    seed: path.relative(process.cwd(), logPaths.seed),
    summary: path.relative(process.cwd(), logPaths.summary)
  }
};

const persistMetadata = () => {
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
};
persistMetadata();

const annotate = (message) => {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(line);
  writeLog(logPaths.summary, `${line}\n`);
};

const run = (label, command, args, logKey, options = {}) => {
  const logFile = logPaths[logKey];
  annotate(label);
  const commandMeta = {
    label,
    command: [command, ...args].join(' '),
    startedAt: new Date().toISOString()
  };
  metadata.commands.push(commandMeta);
  persistMetadata();

  const result = spawnSync(command, args, {
    env: process.env,
    encoding: 'utf8',
    stdio: 'pipe',
    ...options
  });

  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';

  if (stdout) {
    process.stdout.write(stdout);
    writeLog(logFile, stdout);
  }

  if (stderr) {
    process.stderr.write(stderr);
    writeLog(logFile, stderr);
  }

  if (result.status !== 0) {
    const joined = [command, ...args].join(' ');
    writeLog(logPaths.summary, `[ERROR] Command "${joined}" exited with code ${result.status ?? 'unknown'}\n`);
    commandMeta.completedAt = new Date().toISOString();
    commandMeta.status = 'failed';
    commandMeta.exitCode = result.status ?? null;
    persistMetadata();
    throw new Error(`Command "${joined}" exited with code ${result.status ?? 'unknown'}`);
  }

  commandMeta.completedAt = new Date().toISOString();
  commandMeta.status = 'success';
  persistMetadata();
};

try {
  annotate(`Logs archived to ${runDir}`);
  run('[smoke] generating prisma client', 'npx', ['prisma', 'generate', '--schema', schemaPath], 'generate');

  run('[smoke] running prisma migrate deploy', 'npx', ['prisma', 'migrate', 'deploy', '--schema', schemaPath], 'migrate');

  run('[smoke] seeding baseline data', 'npm', ['run', 'prisma:seed'], 'seed');

  annotate('[smoke] database migrations and seed completed successfully');
  metadata.status = 'success';
  metadata.completedAt = new Date().toISOString();
  persistMetadata();
} catch (error) {
  metadata.status = 'failure';
  metadata.completedAt = new Date().toISOString();
  metadata.error = error instanceof Error ? error.message : String(error);
  persistMetadata();
  annotate(
    `[smoke] database verification failed: ${error instanceof Error ? error.message : String(error)}`
  );
  annotate(`[smoke] inspect logs under ${runDir} for detailed output.`);
  process.exit(1);
}
