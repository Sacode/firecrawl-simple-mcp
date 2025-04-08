/**
 * Integration tests for the Firecrawl MCP Map Tool.
 *
 * These tests verify sitemap generation under various conditions:
 * - Basic sitemap generation for a root URL
 * - Respecting a specified limit on the number of URLs
 * - Ignoring existing sitemaps when instructed
 *
 * The tests ensure the Map Tool produces expected output formats and URL counts.
 */

import { describe, it, expect } from 'vitest';
import type { ContentResult } from 'fastmcp';
import { mapTool } from '../src/tools/map';

const mockContext = {
  session: undefined,
  reportProgress: async () => {
    // no operation
  },
  log: {
    debug: () => {
      // no operation
    },
    error: () => {
      // no operation
    },
    info: () => {
      // no operation
    },
    warn: () => {
      // no operation
    },
  },
};

describe('Map Tool Integration', () => {
  it('should generate a sitemap containing at least the root URL', async () => {
    const result = (await mapTool.execute(
      {
        url: 'https://example.com',
      },
      mockContext,
    )) as ContentResult;

    expect(result.isError).toBe(false); // Expect successful execution
    expect(result.content).toHaveLength(1); // Should return a single sitemap text block
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('https://example.com'); // Root URL should be included
  });

  it('should generate a sitemap with no more than 5 URLs when a limit is set', async () => {
    const result = (await mapTool.execute(
      {
        url: 'https://example.com',
        limit: 5,
      },
      mockContext,
    )) as ContentResult;

    expect(result.isError).toBe(false); // Expect successful execution
    expect(result.content).toHaveLength(1); // Should return a single sitemap text block
    const text = (result.content[0] as { text: string }).text;
    const urlMatches = text.match(/https?:\/\/[^\s)]+/g) ?? []; // Extract all URLs from sitemap text
    expect(urlMatches.length).toBeLessThanOrEqual(5); // Number of URLs should respect the limit
  });

  it("should generate a sitemap ignoring the website's existing sitemap when instructed", async () => {
    const result = (await mapTool.execute(
      {
        url: 'https://example.com',
        ignoreSitemap: true,
      },
      mockContext,
    )) as ContentResult;

    expect(result.isError).toBe(false); // Expect successful execution
    expect(result.content).toHaveLength(1); // Should return a single sitemap text block
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('https://example.com'); // Root URL should be included
  });
});
