# Firecrawl Simple MCP Server

A Model Context Protocol (MCP) server for Firecrawl Simple, a powerful web scraping and site mapping tool that enables Large Language Models (LLMs) to access and process web content.

## Project Links

- [GitHub Repository](https://github.com/Sacode/firecrawl-simple-mcp)
- [npm Package](https://www.npmjs.com/package/firecrawl-simple-mcp)

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Available Tools](#available-tools)
- [Troubleshooting](#troubleshooting)
- [Note on Crawl Functionality](#note-on-crawl-functionality)
- [Architecture Improvements](#architecture-improvements)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

Before installing and using Firecrawl Simple MCP Server, ensure you have:

- Node.js 16.x or higher installed
- Access to a running Firecrawl Simple API instance
- Sufficient permissions to install global npm packages (if installing globally)

## Quick Start

```bash
# Install the package
npm install -g firecrawl-simple-mcp

# Run with default configuration
FIRECRAWL_API_URL=http://localhost:3002/v1 firecrawl-simple-mcp

# Test with a simple scrape request
curl -X POST http://localhost:3003/mcp/tool \
  -H "Content-Type: application/json" \
  -d '{"name":"firecrawl_scrape","arguments":{"url":"https://example.com"}}'
```

## Features

- **Web Scraping**: Scrape content from any URL with JavaScript rendering support.
- **Website Mapping**: Generate a sitemap of a given site.
- **Simplified Architecture**: Optimized codebase with consistent patterns and improved error handling.
- **Type Safety**: Strong typing throughout the codebase with Zod schema validation.
- **Configurable**: Customize behavior through environment variables.

## Installation

### Using npm

```bash
npm install -g firecrawl-simple-mcp
```

### From Source

```bash
git clone https://github.com/dsafonov/firecrawl-simple-mcp.git
cd firecrawl-simple-mcp
npm install
npm run build
```

## Usage

### Running the Server

```bash
# Basic usage with self-hosted Firecrawl Simple
FIRECRAWL_API_URL=http://localhost:3002/v1 firecrawl-simple-mcp

# With additional configuration
FIRECRAWL_API_URL=http://localhost:3002/v1 \
FIRECRAWL_LOG_LEVEL=DEBUG \
firecrawl-simple-mcp
```

### Configuration

The server can be configured using environment variables:

| Variable                   | Description                                      | Default                    |
| -------------------------- | ------------------------------------------------ | -------------------------- |
| `FIRECRAWL_API_URL`        | URL of the Firecrawl Simple API                  | `http://localhost:3002/v1` |
| `FIRECRAWL_API_KEY`        | API key for authentication (if required)         | -                          |
| `FIRECRAWL_API_TIMEOUT`    | API request timeout in milliseconds              | `30000`                    |
| `FIRECRAWL_SERVER_PORT`    | Port for the MCP server when using SSE transport | `3003`                     |
| `FIRECRAWL_TRANSPORT_TYPE` | Transport type (`stdio` or `sse`)                | `stdio`                    |
| `FIRECRAWL_LOG_LEVEL`      | Logging level (DEBUG, INFO, WARN, ERROR)         | `INFO`                     |
| `FIRECRAWL_VERSION`        | Version identifier                               | `1.0.0`                    |

### Using with Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "firecrawl-simple-mcp": {
      "command": "npx",
      "args": ["-y", "firecrawl-simple-mcp"],
      "env": {
        "FIRECRAWL_API_URL": "http://localhost:3002/v1"
      }
    }
  }
}
```

### Using with Cursor

To configure in Cursor:

1. Open Cursor Settings
2. Go to Features > MCP Servers
3. Click "+ Add New MCP Server"
4. Enter the following:
   - Name: "firecrawl-simple-mcp" (or your preferred name)
   - Type: "command"
   - Command: `env FIRECRAWL_API_URL=http://localhost:3002/v1 npx -y firecrawl-simple-mcp`

## Available Tools

### 1. Scrape Tool (`firecrawl_scrape`)

Scrape content from a single URL with JavaScript rendering support.

```json
{
  "name": "firecrawl_scrape",
  "arguments": {
    "url": "https://example.com",
    "formats": ["markdown", "html", "rawHtml"],
    "waitFor": 1000,
    "timeout": 30000,
    "includeTags": ["article", "main"],
    "excludeTags": ["nav", "footer"],
    "headers": {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept-Language": "en-US,en;q=0.9"
    },
    "mobile": false
  }
}
```

Parameters:

- `url` (required): The URL to scrape.
- `formats`: Array of output formats to return. Options include "markdown", "html", and "rawHtml".
- `waitFor`: Time to wait for JavaScript execution in milliseconds.
- `timeout`: Request timeout in milliseconds.
- `includeTags`: HTML tags to include in the result.
- `excludeTags`: HTML tags to exclude from the result.
- `headers`: Custom HTTP headers to send with the request.
- `mobile`: Whether to use a mobile viewport.

### 2. Map Tool (`firecrawl_map`)

Generate a sitemap of a given site.

```json
{
  "name": "firecrawl_map",
  "arguments": {
    "url": "https://example.com",
    "search": "optional search term",
    "ignoreSitemap": true,
    "includeSubdomains": false,
    "limit": 5000
  }
}
```

Parameters:

- `url` (required): The URL to map.
- `search`: Search term to filter URLs.
- `ignoreSitemap`: Whether to ignore sitemap.xml.
- `includeSubdomains`: Include subdomains in mapping.
- `limit`: Maximum number of URLs to map.

## Troubleshooting

### Common Errors and Solutions

#### Connection Issues

**Error**: `Failed to connect to Firecrawl API at http://localhost:3002/v1`

**Solution**:

- Verify that the Firecrawl Simple API is running
- Check that the API URL is correct, including the `/v1` path
- Ensure there are no network restrictions blocking the connection

#### Authentication Errors

**Error**: `Authentication failed: Invalid API key`

**Solution**:

- Verify that the `FIRECRAWL_API_KEY` is correct
- Check if the API requires authentication
- Contact the API administrator for valid credentials

#### Timeout Errors

**Error**: `Request timed out after 30000ms`

**Solution**:

- Increase the `FIRECRAWL_API_TIMEOUT` value
- Check if the target website is slow or unresponsive
- Consider using the `waitFor` parameter to allow more time for JavaScript execution

#### Rate Limiting

**Error**: `Rate limit exceeded`

**Solution**:

- Reduce the frequency of requests
- Implement your own rate limiting strategy
- Contact the API administrator for increased rate limits

#### Invalid URL Errors

**Error**: `Invalid URL format`

**Solution**:

- Ensure the URL includes the protocol (http:// or https://)
- Check for typos in the domain name
- Verify that the URL is accessible in a regular browser

## Note on Crawl Functionality

The crawl functionality has been intentionally removed from this MCP server for the following reasons:

1. **Context Management**: The crawl functionality provides too much information in the context of an MCP server, which can lead to context overflow issues for LLMs. This is because crawling multiple pages generates large amounts of text that would exceed the context limits of most models.

2. **Asynchronous Operation**: Crawling runs asynchronously, which is not ideal for the MCP server architecture that works best with synchronous request-response patterns. The asynchronous nature of crawling makes it difficult to integrate with the synchronous communication model of MCP.

3. **Documentation Alignment**: We've aligned the available tools with the primary documentation to ensure consistency and clarity for users.

If you need website crawling capabilities, consider using the individual scrape tool with multiple targeted URLs or implementing a custom solution outside the MCP server.

## Architecture Improvements

The codebase has been optimized with several key improvements:

### 1. Simplified Service Layer

- Functional approach with reduced duplication.
- Consistent error handling across all service methods.
- Strong input validation using Zod schemas.
- Clear separation of concerns between services and tools.

### 2. Enhanced Error Handling

- Centralized error handling utilities.
- Consistent error formatting for better user experience.
- Proper error classification (validation, API, network, timeout).
- Improved error logging with context information.
- User-friendly error messages for LLM consumption.

### 3. Type Safety Improvements

- Eliminated unsafe `any` types.
- Added proper type assertions and validations.
- Consistent return types with proper error flags.
- Zod schema validation for configuration and tool inputs.

### 4. Configuration Management

- Robust environment variable handling with validation.
- Fallback to sensible defaults when configuration is invalid.
- Clear error messages for configuration issues.
- Centralized configuration module.

### 5. Code Organization

- Consistent file and module structure.
- Factory patterns for creating tools and responses.
- Simplified API client usage.
- Better separation of concerns.

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run coverage

# Lint code
npm run lint

# Type check
npm run typecheck
```

## Testing

The project includes comprehensive tests for all tools and services. To run the tests:

```bash
npm test
```

To generate a test coverage report:

```bash
npm run coverage
```

The test suite includes:

- Unit tests for all MCP tools.
- Error handling tests.
- Parameter validation tests.
- Input validation tests.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License.
