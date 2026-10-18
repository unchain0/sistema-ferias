/**
 * Strict ESLint configuration for Sistema de Férias
 * Enforces highest code quality standards with type-checked rules
 */
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
const complexityPlugin = require('eslint-plugin-complexity');
const unicornPlugin = require('eslint-plugin-unicorn');
const importPlugin = require('eslint-plugin-import');
const promisePlugin = require('eslint-plugin-promise');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.verify-evidence/**',
      '.cursor/**',
      '*.config.js',
      '*.config.mjs',
      'middleware.ts',
      'middleware-custom.ts',
      'scripts/**',
    ],
  },

  // Base recommended configs (flat config format)
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  reactHooksPlugin.configs['recommended-latest'],
  jsxA11yPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  promisePlugin.configs['flat/recommended'],
  unicornPlugin.configs['flat/recommended'],
  eslintConfigPrettier,

  // TypeScript type-checked rules require project config
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },

  // Main configuration
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: reactPlugin,
      complexity: complexityPlugin,
      promise: promisePlugin,
    },

    settings: {
      react: {
        version: '18.3',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json', './tsconfig.node.json'],
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },

    rules: {
      // ========== TypeScript Strictness ==========
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/no-unnecessary-condition': [
        'warn',
        {
          allowConstantLoopConditions: true,
        },
      ],
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/strict-boolean-expressions': [
        'warn',
        {
          allowString: true,
          allowNumber: true,
          allowNullableObject: true,
          allowNullableBoolean: true,
          allowNullableString: true,
          allowNullableNumber: true,
          allowAny: false,
        },
      ],
      '@typescript-eslint/no-confusing-void-expression': 'error',
      '@typescript-eslint/no-unnecessary-type-arguments': 'error',
      '@typescript-eslint/no-unnecessary-type-constraint': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/prefer-readonly-parameter-types': 'warn',
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-redundant-type-constituents': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/dot-notation': 'off',

      // ========== Complexity Limits ==========
      complexity: ['error', { max: 15 }],
      'max-depth': ['error', { max: 4 }],
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 80, skipBlankLines: true, skipComments: true }],
      'max-nested-callbacks': ['error', { max: 4 }],
      'max-params': ['error', { max: 5 }],

      // ========== Code Quality ==========
      'no-console': ['error', { allow: ['warn', 'error', 'log'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-duplicate-imports': 'error',
      'no-restricted-globals': ['error', 'isFinite', 'isNaN'],
      'prefer-const': 'error',
      'prefer-template': 'error',
      'object-shorthand': 'error',
      'no-var': 'error',
      'no-useless-concat': 'error',
      'no-useless-rename': 'error',
      'no-return-await': 'error',
      'no-await-in-loop': 'warn',
      'no-promise-executor-return': 'error',
      'require-atomic-updates': 'error',
      'default-case-last': 'error',
      'grouped-accessor-pairs': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-destructuring': ['error', { array: false, object: true }],
      'prefer-spread': 'error',
      'prefer-rest-params': 'error',
      'no-constant-binary-expression': 'error',

      // ========== Unicorn (Modern JS) - subset of available rules ==========
      'unicorn/prevent-abbreviations': [
        'warn',
        {
          replacements: {
            props: { properties: true },
            args: { arguments: true },
            params: { parameters: true },
            ref: { reference: true },
            fn: { function: true },
            impl: { implementation: true },
            env: { environment: true },
            msg: { message: true },
            err: { error: true },
            e: { error: true },
            res: { response: true },
            req: { request: true },
            val: { value: true },
            num: { number: true },
            str: { string: true },
            bool: { boolean: true },
            obj: { object: true },
            arr: { array: true },
            cb: { callback: true },
            opts: { options: true },
            cfg: { config: true },
            auth: { authentication: true },
            authn: { authentication: true },
            authz: { authorization: true },
          },
          allowList: {
            id: true,
            ok: true,
            i: true,
            x: true,
            y: true,
            z: true,
            db: true,
            dbSwitch: true,
            dbSupabase: true,
            uuid: true,
            RouteParams: true,
            orderDir: true,
            orderDirRaw: true,
          },
        },
      ],
      'unicorn/no-null': 'off',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-modern-dom-apis': 'error',
      'unicorn/prefer-array-flat-map': 'error',
      'unicorn/prefer-array-find': 'error',
      'unicorn/prefer-at': 'error',
      'unicorn/prefer-object-from-entries': 'error',
      'unicorn/prefer-query-selector': 'error',
      'unicorn/prefer-spread': 'error',
      'unicorn/no-useless-fallback-in-spread': 'error',
      'unicorn/no-unnecessary-await': 'error',
      'unicorn/no-unnecessary-polyfills': 'error',
      'unicorn/custom-error-definition': 'error',
      'unicorn/prefer-code-point': 'error',
      'unicorn/prefer-date-now': 'error',
      'unicorn/prefer-dom-node-append': 'error',
      'unicorn/prefer-dom-node-dataset': 'error',
      'unicorn/prefer-dom-node-remove': 'error',
      'unicorn/prefer-json-parse-buffer': 'warn',
      'unicorn/prefer-math-trunc': 'error',
      'unicorn/prefer-number-properties': 'error',
      'unicorn/prefer-optional-catch-binding': 'error',
      'unicorn/prefer-reflect-apply': 'error',
      'unicorn/prefer-regexp-test': 'error',
      'unicorn/prefer-set-has': 'error',
      'unicorn/prefer-string-raw': 'error',
      'unicorn/prefer-string-slice': 'error',
      'unicorn/prefer-string-starts-ends-with': 'error',
      'unicorn/prefer-string-replace-all': 'error',
      'unicorn/prefer-ternary': 'error',
      'unicorn/prefer-top-level-await': 'error',
      'unicorn/prefer-type-error': 'error',
      'unicorn/no-negated-condition': 'off',
      'unicorn/no-await-expression-member': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/consistent-function-scoping': 'off',

      // ========== Import Rules ==========
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '~/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
        },
      ],
      'import/no-unresolved': 'error',
      'import/no-cycle': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-default-export': 'off',
      'import/no-named-as-default': 'warn',
      'import/no-named-as-default-member': 'warn',

      // ========== Promise Rules ==========
      'promise/always-return': 'error',
      'promise/catch-or-return': 'error',
      'promise/no-return-wrap': 'error',
      'promise/param-names': 'error',
      'promise/no-new-statics': 'error',
      'promise/valid-params': 'error',

      // ========== React Rules ==========
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'react/self-closing-comp': ['error', { component: true, html: true }],
      'react/no-unused-prop-types': 'warn',
      'react/no-unused-state': 'error',
      'react/no-unused-class-component-methods': 'error',
      'react/button-has-type': 'error',
      'react/no-danger': 'warn',
      'react/no-did-mount-set-state': 'error',
      'react/no-did-update-set-state': 'error',
      'react/no-multi-comp': 'off',
      'react/no-unstable-nested-components': 'warn',
      'react/no-arrow-function-lifecycle': 'error',

      // ========== React Hooks ==========
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // ========== JSX A11y ==========
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/iframe-has-title': 'error',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/no-distracting-elements': 'error',
      'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
      'jsx-a11y/no-onchange': 'warn',
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          controlComponents: ['Input'],
          assert: 'either',
        },
      ],

      // ========== Stylistic (base ESLint) ==========
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
    },
  },

  // API routes - relaxed complexity limits (Next.js handler pattern)
  {
    files: ['app/api/**/*.ts'],
    rules: {
      'max-lines-per-function': ['error', { max: 100, skipBlankLines: true, skipComments: true }],
      complexity: ['error', { max: 20 }],
      'max-depth': ['error', { max: 5 }],
      '@typescript-eslint/prefer-readonly-parameter-types': 'warn',
    },
  },

  // Test files - slightly relaxed rules
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', 'test/**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/require-await': 'off',
      'max-lines-per-function': ['error', { max: 100, skipBlankLines: true, skipComments: true }],
      'complexity': ['error', { max: 20 }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
    },
  },

  // Config files - relaxed
  {
    files: ['*.config.*', '*.config.ts', '*.config.js', '*.config.mjs'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'import/no-default-export': 'off',
    },
  },

  // Type definition files - relaxed abbreviations
  {
    files: ['**/*.d.ts'],
    rules: {
      'unicorn/prevent-abbreviations': 'off',
    },
  }
);