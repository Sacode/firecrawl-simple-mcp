// @ts-check

import eslint from '@eslint/js';
import * as tseslint from 'typescript-eslint';

export default tseslint.config(
    // Base ESLint configuration for all files
    eslint.configs.recommended,

    // TypeScript-specific configurations only for TS files
    tseslint.configs.recommended,

    // Apply type-aware rules only to TS files
    {
        files: ['**/*.ts', '**/*.tsx'],
        extends: [
            tseslint.configs.strictTypeChecked,
            tseslint.configs.stylisticTypeChecked
        ],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    }
);