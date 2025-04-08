/**
 * Integration tests for the Firecrawl MCP Scrape Tool.
 *
 * These tests verify scraping functionality with various options, including:
 * - Basic scraping of page content
 * - Scraping with multiple output formats
 * - Including specific HTML tags
 * - Using custom request headers
 *
 * The tests ensure the scrapeTool behaves correctly under different configurations.
 */

import { describe, it, expect } from 'vitest';
import { scrapeTool } from '../src/tools/scrape';
import type { ContentResult } from 'fastmcp';

/**
 * Mock context object to satisfy scrapeTool dependencies during tests.
 */
const mockContext = {
  session: undefined,
  reportProgress: async () => {
    // no operation needed for tests
  },
  log: {
    debug: () => {
      // no operation needed for tests
    },
    error: () => {
      // no operation needed for tests
    },
    info: () => {
      // no operation needed for tests
    },
    warn: () => {
      // no operation needed for tests
    },
  },
};

describe('Firecrawl Scrape Tool Integration Tests', () => {
  it('should scrape basic page content successfully', async () => {
    const result = (await scrapeTool.execute(
      {
        url: 'https://example.com',
      },
      mockContext,
    )) as ContentResult;

    expect(result.isError).toBe(false); // Expect no error during scraping
    expect(result.content).toHaveLength(1); // Should return one content block
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('example'); // Basic check for expected content
  });

  it('should scrape with multiple formats including markdown and raw HTML', async () => {
    const result = (await scrapeTool.execute(
      {
        url: 'https://example.com',
        formats: ['markdown', 'rawHtml'],
      },
      mockContext,
    )) as ContentResult;

    expect(result.isError).toBe(false);
    expect(result.content).toHaveLength(1);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('example');
    expect(text.toLowerCase()).toContain('<html'); // Raw HTML should be included
  });

  it('should scrape including only specific tags (h1 and p)', async () => {
    const result = (await scrapeTool.execute(
      {
        url: 'https://example.com',
        includeTags: ['h1', 'p'],
      },
      mockContext,
    )) as ContentResult;

    expect(result.isError).toBe(false);
    expect(result.content).toHaveLength(1);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('Example Domain'); // h1 content
    expect(text).toContain('This domain is for use'); // p content
  });

  it('should scrape successfully using custom headers', async () => {
    const result = (await scrapeTool.execute(
      {
        url: 'https://example.com',
        headers: {
          'User-Agent': 'TestAgent/1.0',
        },
      },
      mockContext,
    )) as ContentResult;

    expect(result.isError).toBe(false);
    expect(result.content).toHaveLength(1);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('example');
  });
});
