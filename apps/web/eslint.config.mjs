import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import root from '../../eslint.config.mjs';

export default [
  ...root,
  {
    plugins: { '@next/next': nextPlugin, 'react-hooks': reactHooks },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactHooks.configs.recommended.rules,
    },
    settings: { next: { rootDir: '.' } },
  },
];
