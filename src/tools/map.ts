/**
 * MCP tool for mapping a site
 */

import { z } from 'zod';
import { ContentResult } from 'fastmcp';
import { createTool, createTextResponse } from '../utils/tool-factory';
import { getClient } from '../utils/client-factory';
import { ValidationError } from '../utils/error';

/**
 * Input schema for the map tool
 */
export const mapToolSchema = z.object({
  url: z.string().url().describe('The URL to start mapping from (required)'),
  search: z.string().optional().describe('Search query to use for mapping'),
  ignoreSitemap: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to ignore the website's sitemap"),
  includeSubdomains: z
    .boolean()
    .optional()
    .default(false)
    .describe('Include subdomains of the website'),
  limit: z.number().optional().default(5000).describe('Maximum number of links to return'),
});

/**
 * MCP tool definition for mapping a site
 */
export const mapTool = createTool({
  name: 'firecrawl_map',
  description: 'Generate a sitemap of a given site',
  schema: mapToolSchema,
  execute: async (params): Promise<ContentResult> => {
    // Get client and execute operation
    const client = getClient();
    const result = await client.generateSitemap({
      url: params.url,
      search: params.search,
      ignoreSitemap: params.ignoreSitemap,
      includeSubdomains: params.includeSubdomains,
      limit: params.limit,
    });

    if (!result || !('urls' in result) || !Array.isArray(result.urls)) {
      throw new ValidationError('Invalid sitemap result: Missing or invalid urls array');
    }

    const urls = (result as { urls: string[] }).urls;

    // Format the response as markdown
    let responseText = `# Sitemap for ${params.url}\n\n`;

    if (urls.length === 0) {
      responseText += 'No URLs found in the sitemap.\n';
    } else {
      responseText += `Found ${String(urls.length)} URLs:\n\n`;
      urls.forEach((url, index) => {
        responseText += `${String(index + 1)}. ${url}\n`;
      });
    }

    return createTextResponse(responseText);
  },
});
