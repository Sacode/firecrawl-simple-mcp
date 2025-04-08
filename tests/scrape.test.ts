/**
 * Unit tests for the Firecrawl MCP Scrape Tool.
 *
 * These tests verify:
 * - Successful scraping returns expected content.
 * - Proper error handling when scraping fails.
 * - Default behavior when optional parameters are omitted.
 *
 * Mocks are used to simulate the Firecrawl client responses.
 */

import { scrapeTool } from '../src/tools/scrape';
import type { ContentResult } from 'fastmcp';

/**
 * Mock context object simulating the MCP execution environment.
 */
const mockContext = {
  session: undefined,
  reportProgress: async () => {
    // no operation for progress reporting in tests
  },
  log: {
    debug: () => {
      // no operation for debug logs
    },
    error: () => {
      // no operation for error logs
    },
    info: () => {
      // no operation for info logs
    },
    warn: () => {
      // no operation for warning logs
    },
  },
};
import { TextContent } from 'fastmcp';
import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Mock FirecrawlClient with a mock scrapeWebpage method.
 */
const mockScrapeWebpage = vi.fn();
const mockFirecrawlClient = {
  scrapeWebpage: mockScrapeWebpage,
};

/**
 * Mock the 'firecrawl-simple-client' module to return our mock client.
 */
vi.mock('firecrawl-simple-client', () => {
  return {
    FirecrawlClient: vi.fn(() => mockFirecrawlClient),
  };
});

describe('Scrape Tool', () => {
  beforeEach(() => {
    // Reset mock call counts and implementations before each test
    vi.clearAllMocks();
  });

  it('returns content on successful scrape', async () => {
    // Mock a successful scrape response
    const mockResponse = {
      markdown: '# Test Markdown',
      html: '<h1>Test HTML</h1>',
      metadata: {
        title: 'Test Page',
        sourceURL: 'https://example.com',
        statusCode: 200,
      },
    };

    mockScrapeWebpage.mockResolvedValueOnce(mockResponse);

    // Execute the scrape tool with URL and formats
    const result = (await scrapeTool.execute(
      {
        url: 'https://example.com',
        formats: ['markdown'],
      },
      mockContext,
    )) as ContentResult;

    // Should not be an error result
    expect(result.isError).toBe(false);
    // Should return one content item
    expect(result.content).toHaveLength(1);
    // Content type should be 'text'
    expect((result.content[0] as TextContent).type).toBe('text');

    // Verify the mock client was called with expected parameters
    expect(mockScrapeWebpage).toHaveBeenCalledWith({
      url: 'https://example.com',
      formats: ['markdown'],
      waitFor: undefined,
      timeout: 30000,
      includeTags: undefined,
      excludeTags: undefined,
    });
  });

  it('returns error content when scraping fails', async () => {
    // Mock a rejected scrape with an error
    const mockError = new Error('Failed to scrape URL');
    mockScrapeWebpage.mockRejectedValueOnce(mockError);

    // Execute the scrape tool expecting error handling
    const result = (await scrapeTool.execute(
      {
        url: 'https://example.com',
        formats: ['markdown'],
      },
      mockContext,
    )) as ContentResult;

    // Should indicate an error result
    expect(result.isError).toBe(true);
    // Should return one content item with error text
    expect(result.content).toHaveLength(1);
    expect((result.content[0] as TextContent).type).toBe('text');
    expect((result.content[0] as TextContent).text).toContain('Error:');
  });

  it('defaults to markdown format when none specified', async () => {
    // Mock a successful scrape response with default format
    const mockResponse = {
      markdown: '# Test Markdown',
      metadata: {
        title: 'Test Page',
        sourceURL: 'https://example.com',
        statusCode: 200,
      },
    };

    mockScrapeWebpage.mockResolvedValueOnce(mockResponse);

    // Execute the scrape tool without specifying formats
    const result = (await scrapeTool.execute(
      {
        url: 'https://example.com',
      },
      mockContext,
    )) as ContentResult;

    // Should call the client with default 'markdown' format
    expect(mockScrapeWebpage).toHaveBeenCalledWith({
      url: 'https://example.com',
      formats: ['markdown'],
      waitFor: undefined,
      timeout: 30000,
      includeTags: undefined,
      excludeTags: undefined,
    });

    expect(result.isError).toBe(false);
  });
});
