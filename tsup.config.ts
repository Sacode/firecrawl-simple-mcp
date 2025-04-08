import { defineConfig } from 'tsup';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read version from package.json at build time
const packageJson = JSON.parse(readFileSync(resolve(__dirname, './package.json'), 'utf8'));

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  target: 'es2020',
  minify: true,
  treeshake: true,
  splitting: true,
  esbuildOptions(options) {
    // Add banner
    options.banner = {
      js: '// Firecrawl Simple MCP Server - https://github.com/firecrawl/firecrawl-simple-mcp',
    };

    // Define version constant at build time
    options.define = {
      'process.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
    };
  },
});
