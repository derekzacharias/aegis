import type { Config } from 'jest';

type SupportedEnvironment = 'node' | 'jsdom';

const JSDOM_SETUP_PATH = '<rootDir>/../../tools/testing/setup-jsdom.ts';

const unique = <T,>(items: T[]): T[] => Array.from(new Set(items));

const resolveSetupFiles = (
  environment: SupportedEnvironment,
  setupFilesAfterEnv: Config['setupFilesAfterEnv']
): Config['setupFilesAfterEnv'] | undefined => {
  const normalized = setupFilesAfterEnv ?? [];

  if (environment !== 'jsdom') {
    return normalized.length ? unique(normalized) : undefined;
  }

  const withDomSetup = [JSDOM_SETUP_PATH, ...normalized];
  return unique(withDomSetup);
};

export const withJestEnvironment = (
  environment: SupportedEnvironment,
  config: Config.InitialOptions
): Config.InitialOptions => {
  const setupFilesAfterEnv = resolveSetupFiles(environment, config.setupFilesAfterEnv);

  return {
    ...config,
    testEnvironment: environment === 'jsdom' ? 'jest-environment-jsdom' : 'node',
    setupFilesAfterEnv
  };
};

export const withNodeEnvironment = (config: Config.InitialOptions): Config.InitialOptions =>
  withJestEnvironment('node', config);

export const withJsdomEnvironment = (config: Config.InitialOptions): Config.InitialOptions =>
  withJestEnvironment('jsdom', config);
