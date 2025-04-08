/**
 * Simplified configuration module for the Firecrawl Simple MCP server
 */

import { z } from 'zod';
import logger from './utils/logger';

// The version is injected at build time by esbuild define
// This approach doesn't rely on filesystem access at runtime
// At build time, esbuild replaces process.env.PACKAGE_VERSION with the actual version string
// When used as a dependency, this will be the version that was published
const PACKAGE_VERSION = process.env.PACKAGE_VERSION ?? '1.0.0';

/**
 * Server configuration schema
 */
export const ServerConfigSchema = z.object({
  port: z.number().int().positive().default(3003),
  transportType: z.enum(['stdio', 'sse']).default('stdio'),
  logLevel: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']).default('INFO'),
});

/**
 * API configuration schema
 */
export const ApiConfigSchema = z.object({
  url: z.string().url().default('http://localhost:3002/v1'),
  key: z.string().optional(),
  timeout: z.number().int().positive().default(30000),
});

/**
 * Complete configuration schema
 */
export const ConfigSchema = z.object({
  version: z.string().default('1.0.0'),
  api: ApiConfigSchema,
  server: ServerConfigSchema,
});

/**
 * Configuration type
 */
export type Config = z.infer<typeof ConfigSchema>;

/**
 * Load configuration from environment variables with validation
 */
export function loadConfig(): Config {
  try {
    // Create a configuration object from environment variables
    const config = {
      // Version is injected at build time by esbuild define
      version: PACKAGE_VERSION,
      api: {
        url: process.env.FIRECRAWL_API_URL ?? 'http://localhost:3002/v1',
        key: process.env.FIRECRAWL_API_KEY,
        timeout: parseInt(process.env.FIRECRAWL_API_TIMEOUT ?? '30000', 10),
      },
      server: {
        port: parseInt(process.env.FIRECRAWL_SERVER_PORT ?? '3003', 10),
        transportType: (process.env.FIRECRAWL_TRANSPORT_TYPE ?? 'stdio') as 'stdio' | 'sse',
        logLevel: (process.env.FIRECRAWL_LOG_LEVEL ?? 'INFO') as
          | 'DEBUG'
          | 'INFO'
          | 'WARN'
          | 'ERROR',
      },
    };

    // Validate the configuration using Zod
    return ConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Provide more helpful error messages for configuration issues
      const formattedErrors = error.errors
        .map(err => {
          const path = err.path.join('.');
          return `  - ${path}: ${err.message}`;
        })
        .join('\n');

      logger.error({ err: error }, `Configuration validation errors:\n${formattedErrors}`);
    } else {
      logger.error(
        { err: error },
        'Configuration error: ' + (error instanceof Error ? error.message : String(error)),
      );
    }

    // Fall back to default configuration
    logger.info('Using default configuration');
    return ConfigSchema.parse({});
  }
}

// Export the validated configuration
export const config = loadConfig();
