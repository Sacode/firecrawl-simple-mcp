/**
 * Simplified FastMCP server implementation for Firecrawl Simple
 */

import { FastMCP, UserError, Tool } from 'fastmcp';
import logger from './utils/logger';

/**
 * Server options for the Firecrawl MCP server
 */
export interface ServerOptions {
  tools: Tool<undefined>[];
  port?: number;
  transportType?: 'stdio' | 'sse';
  version?: string;
}

/**
 * MCP Server interface
 */
export interface McpServer {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  getPort: () => number;
}

/**
 * Create an MCP server using FastMCP
 */
export function createServer(options: ServerOptions): McpServer {
  const port = options.port ?? 3003;
  const tools = options.tools;
  const transportType = options.transportType ?? 'stdio';
  const version = options.version ?? '1.0.0';

  // Create the FastMCP server
  const server = new FastMCP({
    name: 'Firecrawl Simple MCP',
    version: version as `${number}.${number}.${number}`,
  });

  // Track if the server is running
  let isRunning = false;

  // Register all tools - directly using FastMCP Tool type
  for (const tool of tools) {
    server.addTool({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
      execute: async (args: unknown, context) => {
        try {
          logger.info(`Executing tool: ${tool.name}`, { toolName: tool.name });
          // Pass both args and context to the tool's execute function
          return await tool.execute(args, context);
        } catch (err: unknown) {
          // If it's already a UserError, just rethrow it
          if (err instanceof UserError) {
            throw err;
          }

          // Log the error
          logger.error(`Error executing tool ${tool.name}`, err, { toolName: tool.name });

          // Rethrow the error
          throw err;
        }
      },
    });
  }

  return {
    /**
     * Start the server
     */
    start: async () => {
      if (isRunning) {
        logger.warn('Server is already running');
        return;
      }

      try {
        // Configure transport based on options
        const transportConfig =
          transportType === 'sse'
            ? {
                transportType: 'sse' as const,
                sse: {
                  endpoint: '/sse' as `/${string}`,
                  port: port,
                },
              }
            : { transportType: 'stdio' as const };

        // Start the server with configured transport
        await server.start(transportConfig);
        isRunning = true;

        logger.info(`MCP Server started successfully with ${transportType} transport`, {
          transportType,
        });
        if (transportType === 'sse') {
          logger.info(`Server listening on port ${String(port)}`, { port });
        }
      } catch (err: unknown) {
        logger.error('Failed to start MCP Server', err);
        throw new Error(`Server start failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    },

    /**
     * Stop the server
     */
    stop: async () => {
      if (!isRunning) {
        logger.warn('Server is not running');
        return;
      }

      try {
        await server.stop();

        // Mark server as stopped
        isRunning = false;

        logger.info('MCP Server stopped');
      } catch (err: unknown) {
        logger.error('Failed to stop MCP Server', err);
        throw new Error(`Server stop failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    },

    /**
     * Get the server port
     */
    getPort: () => {
      return port;
    },
  };
}
