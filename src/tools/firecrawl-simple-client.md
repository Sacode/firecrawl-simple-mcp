# Firecrawl Simple API Client

[![npm version](https://img.shields.io/npm/v/firecrawl-simple-client.svg)](https://www.npmjs.com/package/firecrawl-simple-client)
[![Build Status](https://github.com/Sacode/firecrawl-simple-client/actions/workflows/ci.yml/badge.svg)](https://github.com/Sacode/firecrawl-simple-client/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8%2B-blue)](https://www.typescriptlang.org/)

A TypeScript API client library for Firecrawl Simple.

## What is Firecrawl Simple?

Firecrawl Simple is a stripped down and stable version of Firecrawl optimized for self-hosting and ease of contribution. Billing logic and AI features are completely removed.

## Installation

```bash
npm install firecrawl-simple-client
```

## Structure

The API client is organized for better flexibility and maintainability:

```
src/
├── firecrawl-client.ts - Main API client class implementation
├── config.ts           - Configuration types and defaults
├── index.ts            - Entry point exporting the API client and types
├── v1-openapi.json     - OpenAPI specification for v1 of the API
└── client/             - Auto-generated API client code
    ├── client.gen.ts   - Generated client code
    ├── index.ts        - Exports from generated code
    ├── sdk.gen.ts      - Generated SDK functions
    ├── types.gen.ts    - Generated type definitions
    └── zod.gen.ts      - Generated Zod schemas
```

## Usage

### Creating a Client Instance

```typescript
import { FirecrawlClient } from 'firecrawl-simple-client';

// Create a client with default configuration (localhost:3002/v1)
const client = new FirecrawlClient();

// Create a client with custom configuration
const clientWithConfig = new FirecrawlClient({
  apiUrl: 'https://api.firecrawl.com/v1',
  apiKey: 'your-api-key',
});
```

### Basic Usage

```typescript
import { FirecrawlClient } from 'firecrawl-simple-client';

const client = new FirecrawlClient({
  apiUrl: 'https://api.firecrawl.com/v1',
  apiKey: 'your-api-key',
});

// Start a crawl job
const crawlResult = await client.startCrawl({
  url: 'https://example.com',
  maxDepth: 3,
  limit: 100
});

// Check crawl status
const crawlStatus = await client.getCrawlStatus(crawlResult.id);

// Cancel a crawl job
await client.cancelCrawl(crawlResult.id);

// Scrape a single webpage (synchronous operation)
const scrapeResult = await client.scrapeWebpage({
  url: 'https://example.com',
  waitFor: 0, // Time in ms to wait for JavaScript execution
  formats: ['markdown', 'rawHtml'],
  timeout: 30000
});

// Access scrape results directly
console.log(scrapeResult.data.markdown);

// Generate a sitemap
const sitemapResult = await client.generateSitemap({
  url: 'https://example.com'
});

```

## Configuration

The client can be configured when creating an instance:

```typescript
import { FirecrawlClient } from 'firecrawl-simple-client';

// Default configuration
const DEFAULT_CONFIG = {
  apiUrl: 'http://localhost:3002/v1',
};

// Create a client with custom configuration
const client = new FirecrawlClient({
  apiUrl: 'https://api.firecrawl.com/v1',
  apiKey: 'your-api-key',
});

// Get the current configuration
const config = client.getConfig();
console.log(config);
```

## API Reference

### FirecrawlClient

The main client class for interacting with the Firecrawl API.

#### Constructor

```typescript
new FirecrawlClient(config?: Partial<FirecrawlConfig>)
```

#### Methods

- `getConfig()`: Returns the current configuration
- `startCrawl(options)`: Start a new web crawling job
- `getCrawlStatus(jobId)`: Get the status of a crawl job
- `cancelCrawl(jobId)`: Cancel a running crawl job
- `scrapeWebpage(options)`: Scrape a single webpage (synchronous operation)
- `generateSitemap(options)`: Generate a sitemap for a website

### Scrape Options

```typescript
{
  url: string;                  // The URL to scrape (required)
  formats?: Array<'markdown' | 'rawHtml' | 'screenshot'>;  // Formats to include in the output
  includeTags?: Array<string>;  // HTML tags to include in the result
  excludeTags?: Array<string>;  // HTML tags to exclude from the result
  headers?: object;             // Custom headers for the request
  waitFor?: number;             // Time in ms to wait for JavaScript execution
  timeout?: number;             // Request timeout in milliseconds
}
```

### Crawl Options

```typescript
{
  url: string;                  // The URL to start crawling from (required)
  maxDepth?: number;            // Maximum depth to crawl
  limit?: number;               // Maximum number of pages to crawl
  includePaths?: Array<string>; // URL patterns to include
  excludePaths?: Array<string>; // URL patterns to exclude
  ignoreSitemap?: boolean;      // Whether to ignore the website's sitemap
  allowBackwardLinks?: boolean; // Allow navigation to previously linked pages
  allowExternalLinks?: boolean; // Allow following links to external websites
  webhookUrl?: string;          // URL to send webhook notifications to
  webhookMetadata?: object;     // Metadata to include in webhook notifications
  scrapeOptions?: {             // Options for scraping each page
    formats?: Array<'markdown' | 'rawHtml' | 'screenshot'>;  // Formats to include
    headers?: object;           // Custom headers for requests
    includeTags?: Array<string>; // HTML tags to include
    excludeTags?: Array<string>; // HTML tags to exclude
    waitFor?: number;           // Time to wait for JavaScript execution
  }
}

### Sitemap Options

```typescript
{
  url: string;                  // The URL to start mapping from (required)
  search?: string;              // Search query to use for mapping
  ignoreSitemap?: boolean;      // Whether to ignore the website's sitemap
  includeSubdomains?: boolean;  // Include subdomains of the website
  limit?: number;               // Maximum number of links to return
}
```

### Error Handling

The API may return the following error codes:

- `402`: Payment Required - You've exceeded your usage limits
- `429`: Too Many Requests - Rate limit exceeded
- `404`: Not Found - Resource not found (e.g., when checking status of a non-existent job)
- `500`: Server Error - Internal server error

These errors are properly typed in the SDK, allowing for type-safe error handling in TypeScript:

```typescript
try {
  const result = await client.scrapeWebpage({ url: 'https://example.com' });
  // Process successful result
} catch (error) {
  if (error.response?.status === 429) {
    console.error('Rate limit exceeded. Please try again later.');
  } else if (error.response?.status === 404) {
    console.error('The specified resource could not be found.');
  }
}
```

- `500`: Server Error - Internal server error

## Examples

The package includes example code in the `examples/` directory:

- `basic-usage.js` - Simple examples for common operations
- `advanced-usage.ts` - TypeScript examples with error handling and parallel operations

## License

MIT
