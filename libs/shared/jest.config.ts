/* eslint-disable */
import { withNodeEnvironment } from '../../tools/testing/jest-config';

export default withNodeEnvironment({
  displayName: 'shared',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/shared'
});
