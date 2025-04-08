/**
 * MCP tool for scraping a URL
 */

import { z } from 'zod';
import { ContentResult } from 'fastmcp';
import { createTool, createJsonResponse } from '../utils/tool-factory';
import { getClient } from '../utils/client-factory';
import { ValidationError } from '../utils/error';

/**
 * Input schema for the scrape tool
 */
export const scrapeToolSchema = z.object({
  url: z.string().url().describe('The URL to scrape (required)'),
  formats: z
    .array(z.enum(['markdown', 'rawHtml', 'screenshot']))
    .optional()
    .default(['markdown'])
    .describe('Formats to include in the output'),
  includeTags: z.array(z.string()).optional().describe('HTML tags to include in the result'),
  excludeTags: z.array(z.string()).optional().describe('HTML tags to exclude from the result'),
  headers: z.record(z.string()).optional().describe('Custom headers for the request'),
  waitFor: z.number().optional().describe('Time in ms to wait for JavaScript execution'),
  timeout: z.number().optional().default(30000).describe('Request timeout in milliseconds'),
});

/**
 * MCP tool definition for scraping a URL
 */
export const scrapeTool = createTool({
  name: 'firecrawl_scrape',
  description: 'Scrape content from a URL with JavaScript rendering support',
  schema: scrapeToolSchema,
  execute: async (params): Promise<ContentResult> => {
    // Extract only the parameters expected by the client
    const scrapeParams = {
      url: params.url,
      formats: params.formats,
      waitFor: params.waitFor,
      timeout: params.timeout,
      includeTags: params.includeTags,
      excludeTags: params.excludeTags,
      headers: params.headers,
    };

    // Get client and execute operation
    const client = getClient();
    const result = await client.scrapeWebpage(scrapeParams);

    if (!result) {
      throw new ValidationError('Failed to scrape webpage: No result returned');
    }

    // Return the result as JSON
    return createJsonResponse(result);
  },
});
