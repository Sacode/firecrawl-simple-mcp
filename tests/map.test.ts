import { mapTool } from '../src/tools/map';
import { FirecrawlClient } from 'firecrawl-simple-client';
import { TextContent } from 'fastmcp';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Create a mock instance
const mockGenerateSitemap = vi.fn();
const mockFirecrawlClient = {
  generateSitemap: mockGenerateSitemap
};

// Mock the FirecrawlClient constructor
vi.mock('firecrawl-simple-client', () => {
  return {
    FirecrawlClient: vi.fn(() => mockFirecrawlClient)
  };
});

describe('Map Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully generate a sitemap', async () => {
    // Mock successful response
    const mockResponse = {
      urls: [
        'https://example.com',
        'https://example.com/about',
        'https://example.com/contact'
      ]
    };

    mockGenerateSitemap.mockResolvedValueOnce(mockResponse);

    // Execute the tool
    const result = await mapTool.execute({
      url: 'https://example.com',
      limit: 10
    });

    // Verify the result
    expect(result.isError).toBe(false);
    expect(result.content).toHaveLength(1);
    expect((result.content[0] as TextContent).type).toBe('text');
    expect((result.content[0] as TextContent).text).toContain('Found 3 URLs');
    expect((result.content[0] as TextContent).text).toContain('https://example.com');
    
    // Verify the client was called with correct parameters
    expect(mockGenerateSitemap).toHaveBeenCalledWith({
      url: 'https://example.com',
      search: undefined,
      ignoreSitemap: true,
      includeSubdomains: false,
      limit: 10,
    });
  });

  it('should handle empty sitemap results', async () => {
    // Mock empty response
    const mockResponse = {
      urls: []
    };

    mockGenerateSitemap.mockResolvedValueOnce(mockResponse);

    // Execute the tool
    const result = await mapTool.execute({
      url: 'https://example.com'
    });

    // Verify the result
    expect(result.isError).toBe(false);
    expect(result.content).toHaveLength(1);
    expect((result.content[0] as TextContent).type).toBe('text');
    expect((result.content[0] as TextContent).text).toContain('No URLs found in the sitemap');
  });

  it('should handle errors gracefully', async () => {
    // Mock error response
    const mockError = new Error('Failed to generate sitemap');
    mockGenerateSitemap.mockRejectedValueOnce(mockError);

    // Execute the tool
    const result = await mapTool.execute({
      url: 'https://example.com'
    });

    // Verify the result
    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect((result.content[0] as TextContent).type).toBe('text');
    expect((result.content[0] as TextContent).text).toContain('Error:');
  });

  it('should use all provided parameters', async () => {
    // Mock successful response
    const mockResponse = {
      urls: ['https://example.com']
    };

    mockGenerateSitemap.mockResolvedValueOnce(mockResponse);

    // Execute the tool with all parameters
    const result = await mapTool.execute({
      url: 'https://example.com',
      search: 'test',
      ignoreSitemap: false,
      includeSubdomains: true,
      limit: 100
    });

    // Verify the client was called with correct parameters
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