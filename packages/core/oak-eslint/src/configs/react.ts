import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';

const reactHooksRulePlugin = {
  rules: reactHooksPlugin.rules,
};

export const react = defineConfig({
  plugins: {
    react: reactPlugin,
    'react-hooks': reactHooksRulePlugin,
  },
  settings: {
    react: {
      // Literal pin, not 'detect': eslint-plugin-react (7.37.5, the latest
      // release) implements auto-detect via context.getFilename(), an API
      // ESLint 10 removed, so 'detect' crashes on every file in every
      // consuming workspace (version.js:31). The pin skips detection
      // entirely. Matches the estate's React 19.2.x. Revisit when an
      // eslint-plugin-react release lands with ESLint 10 support.
      version: '19.2',
    },
  },
  rules: {
    ...reactHooksPlugin.configs.recommended.rules,
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react/prop-types': 'off',
    'react/no-direct-mutation-state': 'error',
    'react/no-array-index-key': 'error',
    'react/jsx-key': 'error',
    'react/jsx-no-bind': ['error', { allowArrowFunctions: true, allowBind: false }],
    'react/no-children-prop': 'error',
    'react/no-danger-with-children': 'error',
    'react/no-deprecated': 'error',
    'react/no-unescaped-entities': 'error',
    'react/self-closing-comp': 'error',
  },
});
