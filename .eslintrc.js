const { join } = require('path');

module.exports = {
  root: true,
  extends: '@arcblock/eslint-config-ts',
  parserOptions: {
    project: [join(__dirname, 'tsconfig.eslint.json'), join(__dirname, 'tsconfig.json')],
  },
  rules: {
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'no-await-in-loop': 'off',
    'no-nested-ternary': 'off',
    'max-classes-per-file': 'off',
    'react/require-default-props': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    'require-await': 'off',
    'import/prefer-default-export': 'off',
    'no-return-assign': 'off',
    'no-continue': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/no-array-index-key': 'off',
  },
};
