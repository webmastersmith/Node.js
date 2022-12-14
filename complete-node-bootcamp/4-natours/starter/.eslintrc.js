module.exports = {
  env: {
    browser: true,
    amd: true,
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    // indent: ['warning', 2],
    'linebreak-style': ['error', 'unix'],
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/ban-ts-comment': 'off',
    // quotes: ['error', 'single', { allowTemplateLiterals: true }],
    // semi: ['error', 'always'],
    'spaced-comment': 'off',
    // 'no-console': 'warn',
    'consistent-return': 'off',
    'func-names': 'off',
    'object-shorthand': 'off',
    'no-process-exit': 'off',
    'no-param-reassign': 'off',
    'no-return-await': 'off',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
    'prefer-destructuring': ['error', { object: true, array: false }],
    'no-unused-vars': ['warning', { argsIgnorePattern: 'req|res|next|val' }],
    'no-explicit-any': 'off',
  },
};
