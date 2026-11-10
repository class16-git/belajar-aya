import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', 'legacy-site/**', 'docs/**', '**/*.config.*', '**/next-env.d.ts', 'artifacts/**'] },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'log'] }],
    },
  },
);
