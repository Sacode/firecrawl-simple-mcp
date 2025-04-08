/**
 * Client factory for creating and reusing FirecrawlClient instances
 */

import { FirecrawlClient } from 'firecrawl-simple-client';
import { config } from '../config';
import logger from './logger';

// Singleton instance of the client
let clientInstance: FirecrawlClient | null = null;

/**
 * Get a FirecrawlClient instance
 * This factory ensures we only create one client instance per process
 * @returns A FirecrawlClient instance
 */
export function getClient(): FirecrawlClient {
  if (!clientInstance) {
    logger.debug('Creating new FirecrawlClient instance');
    // Create a new client with the configuration from config.ts
    clientInstance = new FirecrawlClient({
      apiUrl: config.api.url,
      apiKey: config.api.key,
    });
  }

  return clientInstance;
}

/**
 * Reset the client instance
 * Useful for testing or when configuration changes
 */
export function resetClient(): void {
  clientInstance = null;
}
