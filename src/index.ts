#!/usr/bin/env node

/**
 * Firecrawl Simple MCP Server
 *
 * A Model Context Protocol (MCP) server for Firecrawl Simple
 */

import { createServer } from './server';
import { config } from './config';
import logger from './utils/logger';

import { scrapeTool } from './tools/scrape';
import { mapTool } from './tools/map';

// Banner
const banner = `
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Firecrawl Simple MCP Server                             ║
║   Web scraping capabilities for LLMs via MCP              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`;

/**
 * Main function to start the MCP server
 */
async function main() {
  // Logger is already initialized with configuration

  logger.info(banner);
  logger.info('Starting Firecrawl Simple MCP Server');
  logger.info({ apiUrl: config.api.url }, `API URL: ${config.api.url}`);
  logger.info({ version: config.version }, `Version: ${config.version}`);

  // Define the MCP tools
  const tools = [scrapeTool, mapTool];

  // Create and start the MCP server with configuration
  const server = createServer({
    tools,
    port: config.server.port,
    transportType: config.server.transportType,
    version: config.version,
  });

  // Set up graceful shutdown handlers
  setupShutdownHandlers(server);

  // Start the server
  try {
    await server.start();

    logger.info('MCP Server started successfully');
    logger.info('Available tools:');
    tools.forEach(tool => {
      logger.info(
        { toolName: tool.name },
        `- ${tool.name}: ${tool.description ?? 'No description'}`,
      );
    });
  } catch (err) {
    logger.error({ err }, 'Failed to start MCP Server');
    process.exit(1);
  }
}

/**
 * Set up handlers for graceful shutdown
 */
function setupShutdownHandlers(server: { stop: () => Promise<void> }) {
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Shutting down MCP Server...');
    void server
      .stop()
      .then(() => {
        process.exit(0);
      })
      .catch((err: unknown) => {
        logger.error({ err }, 'Error during shutdown');
        process.exit(1);
      });
  });

  process.on('SIGTERM', () => {
    logger.info('Shutting down MCP Server...');
    void server
      .stop()
      .then(() => {
        process.exit(0);
      })
      .catch((err: unknown) => {
        logger.error({ err }, 'Error during shutdown');
        process.exit(1);
      });
  });
}

// Start the server
main().catch((err: unknown) => {
  logger.error({ err }, 'Unhandled error');
  process.exit(1);
});
