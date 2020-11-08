/* eslint-disable no-undef, global-require, import/no-extraneous-dependencies */

module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:node/recommended-module', 'airbnb-base', 'plugin:prettier/recommended'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    es2020: true,
    node: true,
  },
  globals: {
    __filename: 'readonly',
    globalThis: 'readonly',
    fetch: 'readonly',
    Request: 'readonly',
    Response: 'readonly',
    File: 'readonly',
    FormData: 'readonly',
    $filepath: 'readonly',
    $jobname: 'readonly',
  },
  rules: {
    'max-len': ['warn', { code: 120 }],
    strict: ['error', 'global'],
    'arrow-parens': ['warn', 'always'],
    'arrow-body-style': 'off',
    camelcase: 'warn',
    'no-underscore-dangle': 'warn',
    'no-param-reassign': 'warn',
    'no-unused-vars': 'warn',
    'class-methods-use-this': 'warn',
    'prefer-destructuring': 'warn',
    'prefer-const': 'warn',
    'no-shadow': 'warn',
    'no-empty': 'warn',
    'max-classes-per-file': 'warn',
    'no-restricted-syntax': require('eslint-config-airbnb-base/rules/style').rules['no-restricted-syntax'].filter(
      (item) => typeof item !== 'object' || item.selector !== 'ForOfStatement',
    ),
    'import/prefer-default-export': 'off',
    'import/no-cycle': 'warn',
    'node/no-extraneous-import': 'off',
    'node/no-unsupported-features/es-syntax': [
      'error',
      {
        ignores: ['modules', 'dynamicImport'],
      },
    ],
  },
  overrides: [
    {
      files: ['*.test.js', '*.spec.js'],
      env: {
        jest: true,
      },
    },
    {
      files: ['scripts/*', '*.seed.js'],
      rules: {
        'no-await-in-loop': 'warn',
        'import/no-dynamic-require': 'warn',
        'global-require': 'warn',
      },
    },
  ],
};
