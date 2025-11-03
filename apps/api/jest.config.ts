/* eslint-disable */
import { withNodeEnvironment } from '../../tools/testing/jest-config';

export default withNodeEnvironment({
  displayName: 'api',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleNameMapper: {
    '^@compliance/shared(.*)$': '<rootDir>/../../libs/shared/src$1',
    '^@compliance/api/(.*)$': '<rootDir>/src/$1'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api'
});
