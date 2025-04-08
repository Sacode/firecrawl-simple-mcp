/**
 * MCP tool for mapping a site
 */

import { z } from 'zod';
import { ContentResult } from 'fastmcp';
import { createTool, createTextResponse } from '../utils/tool-factory';
import { getClient } from '../utils/client-factory';
import { ValidationError } from '../utils/error';

/**
 * Zod schema defining the input parameters for the firecrawl_map tool.
 *
 * Parameters:
 * - url (string, required): The starting URL for sitemap generation.
 * - search (string, optional): A search query to filter or guide the mapping.
 * - ignoreSitemap (boolean, optional, default=true): Whether to ignore the site's existing sitemap.xml.
 * - includeSubdomains (boolean, optional, default=false): Whether to include subdomains in the crawl.
 * - limit (number, optional, default=5000): Maximum number of URLs to return.
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
 * The result returned from the sitemap generation client call.
 */
export interface SitemapResult {
  success: boolean;
  links?: string[];
}

/**
 * MCP tool definition for generating a sitemap of a website.
 *
 * This tool uses the Firecrawl client to crawl a website starting from the provided URL,
 * optionally filtering with a search query, and returns a list of discovered URLs formatted as markdown.
 *
 * The tool parameters are validated against `mapToolSchema`.
 * The response contains a markdown-formatted list of URLs or a message if no URLs were found.
 *
 * Throws:
 * - ValidationError if the sitemap generation fails or returns an invalid result.
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

    if (!result || typeof result !== 'object' || !('success' in result)) {
      throw new ValidationError('Invalid sitemap result: missing success flag');
    }

    if (!result.success) {
      throw new ValidationError('Sitemap generation failed');
    }

    const sitemapResult = result as SitemapResult;
    const urls: string[] = Array.isArray(sitemapResult.links) ? sitemapResult.links : [];

    // Format the response as markdown
    let responseText = `# Sitemap for ${params.url}\n\n`;

    if (urls.length === 0) {
      responseText += 'No URLs found in the sitemap.\n';
    } else {
      responseText += `Found ${String(urls.length)} URLs:\n\n`;
      urls.forEach((url: string, index: number) => {
        responseText += `${String(index + 1)}. ${url}\n`;
      });
    }

    const response = createTextResponse(responseText);
    return response;
  },
});
