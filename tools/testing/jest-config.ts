import type { Config } from '@jest/types';

type SupportedEnvironment = 'node' | 'jsdom';

const JSDOM_SETUP_PATH = '<rootDir>/../../tools/testing/setup-jsdom.ts';

const unique = <T,>(items: T[]): T[] => Array.from(new Set(items));

type JestConfig = Config.InitialOptions;

const resolveSetupFiles = (
  environment: SupportedEnvironment,
  setupFilesAfterEnv: JestConfig['setupFilesAfterEnv']
): JestConfig['setupFilesAfterEnv'] | undefined => {
  const normalized = setupFilesAfterEnv ?? [];

  if (environment !== 'jsdom') {
    return normalized.length ? unique(normalized) : undefined;
  }

  const withDomSetup = [JSDOM_SETUP_PATH, ...normalized];
  return unique(withDomSetup);
};

export const withJestEnvironment = (
  environment: SupportedEnvironment,
  config: JestConfig
): JestConfig => {
  const setupFilesAfterEnv = resolveSetupFiles(environment, config.setupFilesAfterEnv);

  return {
    ...config,
    testEnvironment: environment === 'jsdom' ? 'jest-environment-jsdom' : 'node',
    setupFilesAfterEnv
  };
};

export const withNodeEnvironment = (config: JestConfig): JestConfig =>
  withJestEnvironment('node', config);

export const withJsdomEnvironment = (config: JestConfig): JestConfig =>
  withJestEnvironment('jsdom', config);
