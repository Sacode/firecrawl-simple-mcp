import { scrapeTool } from '../src/tools/scrape';
import { FirecrawlClient } from 'firecrawl-simple-client';
import { TextContent } from 'fastmcp';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Create a mock instance
const mockScrapeWebpage = vi.fn();
const mockFirecrawlClient = {
  scrapeWebpage: mockScrapeWebpage
};

// Mock the FirecrawlClient constructor
vi.mock('firecrawl-simple-client', () => {
  return {
    FirecrawlClient: vi.fn(() => mockFirecrawlClient)
  };
});

describe('Scrape Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully scrape a URL', async () => {
    // Mock successful response
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

    // Execute the tool
    const result = await scrapeTool.execute({
      url: 'https://example.com',
      formats: ['markdown'],
    });

    // Verify the result
    expect(result.isError).toBe(false);
    expect(result.content).toHaveLength(1);
    expect((result.content[0] as TextContent).type).toBe('text');
    
    // Verify the client was called with correct parameters
    expect(mockScrapeWebpage).toHaveBeenCalledWith({
      url: 'https://example.com',
      formats: ['markdown'],
      waitFor: undefined,
      timeout: 30000,
      includeTags: undefined,
      excludeTags: undefined,
    });
  });

  it('should handle errors gracefully', async () => {
    // Mock error response
    const mockError = new Error('Failed to scrape URL');
    mockScrapeWebpage.mockRejectedValueOnce(mockError);

    // Execute the tool
    const result = await scrapeTool.execute({
      url: 'https://example.com',
      formats: ['markdown'],
    });

    // Verify the result
    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect((result.content[0] as TextContent).type).toBe('text');
    expect((result.content[0] as TextContent).text).toContain('Error:');
  });

  it('should use default formats if not provided', async () => {
    // Mock successful response
    const mockResponse = {
      markdown: '# Test Markdown',
      metadata: {
        title: 'Test Page',
        sourceURL: 'https://example.com',
        statusCode: 200,
      },
    };

    mockScrapeWebpage.mockResolvedValueOnce(mockResponse);

    // Execute the tool without specifying formats
    const result = await scrapeTool.execute({
      url: 'https://example.com',
    });

    // Verify the client was called with default formats
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