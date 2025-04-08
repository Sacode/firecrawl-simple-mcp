/**
 * Unit tests for the Firecrawl MCP Map Tool.
 *
 * These tests verify that the Map Tool correctly:
 * - Returns sitemap content on success
 * - Handles empty sitemap results
 * - Handles errors gracefully
 * - Passes all provided parameters to the Firecrawl client
 *
 * Mocks are used to simulate the Firecrawl client behavior.
 */

import { mapTool } from '../src/tools/map';
import { TextContent, Context, ContentResult } from 'fastmcp';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock FirecrawlClient's generateSitemap method
const mockGenerateSitemap = vi.fn();
const mockFirecrawlClient = {
  generateSitemap: mockGenerateSitemap,
};

// Mock the FirecrawlClient constructor to return the mock client
vi.mock('firecrawl-simple-client', () => {
  return {
    FirecrawlClient: vi.fn(() => mockFirecrawlClient),
  };
});

describe('Map Tool', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('returns sitemap content when successful', async () => {
    // Simulate successful sitemap generation with 3 URLs
    const mockResponse = {
      success: true,
      links: ['https://example.com', 'https://example.com/about', 'https://example.com/contact'],
    };
    mockGenerateSitemap.mockResolvedValueOnce(mockResponse);

    const result = (await mapTool.execute(
      { url: 'https://example.com' },
      {} as Context<undefined>,
    )) as ContentResult;

    // Should not be an error result
    expect(result.isError).toBe(false);
    // Should return one content item
    expect(result.content).toHaveLength(1);
    // Content should be of type 'text'
    expect((result.content[0] as TextContent).type).toBe('text');
    // Text should mention number of URLs and include a known URL
    expect((result.content[0] as TextContent).text).toContain('Found 3 URLs');
    expect((result.content[0] as TextContent).text).toContain('https://example.com');

    // Verify correct parameters passed to generateSitemap
    expect(mockGenerateSitemap).toHaveBeenCalledWith({
      url: 'https://example.com',
      search: undefined,
      ignoreSitemap: true,
      includeSubdomains: false,
      limit: 5000,
    });
  });

  it('returns appropriate message when sitemap is empty', async () => {
    // Simulate successful call but with no links found
    const mockResponse = {
      success: true,
      links: [],
    };
    mockGenerateSitemap.mockResolvedValueOnce(mockResponse);

    const result = (await mapTool.execute(
      { url: 'https://example.com' },
      {} as Context<undefined>,
    )) as ContentResult;

    expect(result.isError).toBe(false);
    expect(result.content).toHaveLength(1);
    expect((result.content[0] as TextContent).type).toBe('text');
    // Should mention no URLs found
    expect((result.content[0] as TextContent).text).toContain('No URLs found in the sitemap');
  });

  it('returns error content when sitemap generation fails', async () => {
    // Simulate generateSitemap throwing an error
    const mockError = new Error('Failed to generate sitemap');
    mockGenerateSitemap.mockRejectedValueOnce(mockError);

    const result = (await mapTool.execute(
      { url: 'https://example.com' },
      {} as Context<undefined>,
    )) as ContentResult;

    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect((result.content[0] as TextContent).type).toBe('text');
    // Should include 'Error:' in the returned text
    expect((result.content[0] as TextContent).text).toContain('Error:');
  });

  it('passes all provided parameters to Firecrawl client', async () => {
    // Simulate successful response
    const mockResponse = {
      success: true,
      links: ['https://example.com'],
    };
    mockGenerateSitemap.mockResolvedValueOnce(mockResponse);

    const result = (await mapTool.execute(
      {
        url: 'https://example.com',
        search: 'test',
        ignoreSitemap: false,
        includeSubdomains: true,
        limit: 100,
      },
      {} as Context<undefined>,
    )) as ContentResult;

    // Verify all parameters are forwarded correctly
    expect(mockGenerateSitemap).toHaveBeenCalledWith({
      url: 'https://example.com',
      search: 'test',
      ignoreSitemap: false,
      includeSubdomains: true,
      limit: 100,
    });

    expect(result.isError).toBe(false);
  });
});
