#!/usr/bin/env node

const { spawnSync } = require('child_process');

const schemaPath = 'apps/api/prisma/schema.prisma';

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
    ...options
  });

  if (result.status !== 0) {
    const joined = [command, ...args].join(' ');
    throw new Error(`Command "${joined}" exited with code ${result.status ?? 'unknown'}`);
  }
};

try {
  console.log('[smoke] generating prisma client');
  run('npx', ['prisma', 'generate', '--schema', schemaPath]);

  console.log('[smoke] running prisma migrate deploy');
  run('npx', ['prisma', 'migrate', 'deploy', '--schema', schemaPath]);

  console.log('[smoke] seeding baseline data');
  run('npm', ['run', 'prisma:seed']);

  console.log('[smoke] database migrations and seed completed successfully');
} catch (error) {
  console.error('[smoke] database verification failed:', error instanceof Error ? error.message : error);
  process.exit(1);
}
