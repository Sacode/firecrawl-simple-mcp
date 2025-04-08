/**
 * Firecrawl MCP Tool: Scrape content from a URL with JavaScript rendering support.
 *
 * Defines the schema and implementation for the `firecrawl_scrape` tool,
 * which retrieves webpage content in various formats, optionally including
 * specific HTML tags, custom headers, and JavaScript execution delay.
 */

import { z } from 'zod';
import { ContentResult } from 'fastmcp';
import { createTool, createJsonResponse } from '../utils/tool-factory';
import { getClient } from '../utils/client-factory';
import { ValidationError } from '../utils/error';

/**
 * Schema for the `firecrawl_scrape` tool input parameters.
 */
export const scrapeToolSchema = z.object({
  url: z.string().url().describe('The URL to scrape (required)'),
  formats: z
    .array(z.enum(['markdown', 'rawHtml', 'screenshot']))
    .optional()
    .default(['markdown'])
    .describe('Formats to include in the output'),
  includeTags: z
    .array(z.string())
    .optional()
    .describe('HTML tags to include in the scraped result'),
  excludeTags: z
    .array(z.string())
    .optional()
    .describe('HTML tags to exclude from the scraped result'),
  headers: z.record(z.string()).optional().describe('Custom HTTP headers to send with the request'),
  waitFor: z
    .number()
    .optional()
    .describe('Milliseconds to wait for JavaScript execution before scraping'),
  timeout: z.number().optional().default(30000).describe('Request timeout in milliseconds'),
});

/**
 * The `firecrawl_scrape` MCP tool.
 *
 * Scrapes content from a URL with optional JavaScript rendering delay,
 * custom headers, and output formats.
 */
export const scrapeTool = createTool({
  name: 'firecrawl_scrape',
  description: 'Scrape content from a URL with JavaScript rendering support',
  schema: scrapeToolSchema,
  /**
   * Executes the scrape operation.
   *
   * @param params - Validated input matching `scrapeToolSchema`
   * @returns A promise resolving to the scraped content wrapped as a ContentResult
   * @throws ValidationError if scraping fails or returns no result
   */
  async execute(params): Promise<ContentResult> {
    // Prepare parameters for the underlying client
    const scrapeParams = {
      url: params.url,
      formats: params.formats,
      waitFor: params.waitFor,
      timeout: params.timeout,
      includeTags: params.includeTags,
      excludeTags: params.excludeTags,
      headers: params.headers,
    };

    const client = getClient();
    const result = await client.scrapeWebpage(scrapeParams);

    if (!result) {
      throw new ValidationError('Failed to scrape webpage: No result returned');
    }

    return createJsonResponse(result);
  },
});
