# SearxNG MCP Server

A Model Context Protocol (MCP) server that provides web search capabilities using SearxNG, allowing AI assistants like Claude to search the web.

> _Created by AI with human supervision - because sometimes even artificial intelligence needs someone to tell it when to take a coffee break! 🤖☕_

## Overview

This project implements an MCP server that connects to SearxNG, a privacy-respecting metasearch engine. The server provides a simple and efficient way for Large Language Models to search the web without tracking users.

The server is specifically designed for LLMs and includes only essential features to minimize context window usage. This streamlined approach ensures efficient communication between LLMs and the search engine, preserving valuable context space for more important information.

### Features

- Privacy-focused web search through SearxNG
- Simple API for LLM integration
- Compatible with Claude Desktop and other MCP-compliant clients
- Configurable search parameters
- Clean, formatted search results optimized for LLMs

## Integration with MCP-Compatible Applications

### Integration Examples

#### Using pipx run (Recommended, no installation required)

Create a `.clauderc` file in your home directory:

```json
{
  "mcpServers": {
    "searxng": {
      "command": "pipx",
      "args": ["run", "searxng-simple-mcp@latest"],
      "env": {
        "SEARXNG_MCP_SEARXNG_URL": "https://your-instance.example.com"
      }
    }
  }
}
```

#### Using uvx run (No installation required)

```json
{
  "mcpServers": {
    "searxng": {
      "command": "uvx",
      "args": ["run", "searxng-simple-mcp@latest"],
      "env": {
        "SEARXNG_MCP_SEARXNG_URL": "https://your-instance.example.com"
      }
    }
  }
}
```

#### Using Python with pip (requires installation)

```json
{
  "mcpServers": {
    "searxng": {
      "command": "python",
      "args": ["-m", "searxng_simple_mcp.server"],
      "env": {
        "SEARXNG_MCP_SEARXNG_URL": "https://your-instance.example.com"
      }
    }
  }
}
```

#### Using with Docker (No installation required)

```json
{
  "mcpServers": {
    "searxng": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "--network=host",
        "-e",
        "SEARXNG_MCP_SEARXNG_URL=http://localhost:8080",
        "ghcr.io/sacode/searxng-simple-mcp:latest"
      ]
    }
  }
}
```

**Note:** When using Docker with MCP servers:

1. Environment variables must be passed directly using the `-e` flag in the `args` array, as the `env` object is not properly passed to the Docker container.
2. If you need to access a SearxNG instance running on localhost (e.g., <http://localhost:8080>), you must use the `--network=host` flag to allow the container to access the host's network. Otherwise, "localhost" inside the container will refer to the container itself, not your host machine.
3. When using `--network=host`, port mappings (`-p`) are not needed and will be ignored, as the container shares the host's network stack directly.

## Configuration

Configure the server using environment variables:

| Environment Variable             | Description                                                           | Default Value        |
| -------------------------------- | --------------------------------------------------------------------- | -------------------- |
| SEARXNG_MCP_SEARXNG_URL          | URL of the SearxNG instance to use                                    | <https://paulgo.io/> |
| SEARXNG_MCP_TIMEOUT              | HTTP request timeout in seconds                                       | 10                   |
| SEARXNG_MCP_DEFAULT_RESULT_COUNT | Default number of results to return                                   | 10                   |
| SEARXNG_MCP_DEFAULT_LANGUAGE     | Language code for results (e.g., 'en', 'ru', 'all')                   | all                  |
| SEARXNG_MCP_DEFAULT_FORMAT       | Default format for results ('text', 'json')                           | text                 |
| SEARXNG_MCP_LOG_LEVEL            | Logging level (e.g., 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL') | ERROR                |
| TRANSPORT_PROTOCOL               | Transport protocol ('stdio' or 'sse')                                 | stdio                |

**Note:** Setting log levels higher than ERROR (such as DEBUG or INFO) may break integration with some applications due to excessive output in the communication channel.

You can find a list of public SearxNG instances at [https://searx.space](https://searx.space) if you don't want to host your own.

## Installation & Usage

### Prerequisites

- Python 3.10 or higher
- A SearxNG instance (public or self-hosted)

### Option 1: Run Without Installation (Recommended)

The easiest way to use this server is with pipx or uvx, which allows you to run the package without installing it permanently:

```bash
# Using pipx
pip install pipx  # Install pipx if you don't have it
pipx run searxng-simple-mcp

# OR using uvx
pip install uvx  # Install uvx if you don't have it
uvx run searxng-simple-mcp
```

You can pass configuration options directly:

```bash
# Using pipx with custom SearxNG instance
pipx run searxng-simple-mcp --searxng-url https://your-instance.example.com
```

### Option 2: Install from PyPI or Source

For more permanent installation:

```bash
# From PyPI using pip
pip install searxng-simple-mcp

# OR using uv (faster installation)
pip install uv
uv pip install searxng-simple-mcp

# OR from source
git clone https://github.com/Sacode/searxng-simple-mcp.git
cd searxng-simple-mcp
pip install uv
uv pip install -e .
```

After installation, you can run the server with:

```bash
# Run directly after installation
python -m searxng_simple_mcp.server

# OR with configuration options
python -m searxng_simple_mcp.server --searxng-url https://your-instance.example.com
```

### Option 3: Docker

If you prefer using Docker:

```bash
# Pull the Docker image
docker pull ghcr.io/sacode/searxng-simple-mcp:latest

# Run the container with default settings (stdio transport)
docker run --rm -i ghcr.io/sacode/searxng-simple-mcp:latest

# Run with environment file for configuration
docker run --rm -i --env-file .env ghcr.io/sacode/searxng-simple-mcp:latest

# Run with SSE transport (starts HTTP server on port 8000)
docker run -p 8000:8000 -e TRANSPORT_PROTOCOL=sse ghcr.io/sacode/searxng-simple-mcp:latest

# Building locally
docker build -t searxng-simple-mcp:local .
docker run --rm -i searxng-simple-mcp:local

# Using Docker Compose
docker-compose up -d
```

For complete Docker usage information, see the [Docker Configuration](#docker-configuration) section below.

## Transport Protocols

The MCP server supports two transport protocols:

- **STDIO** (default): For CLI applications and direct integration

  - Used by default in all examples
  - Suitable for integration with Claude Desktop and other MCP-compliant clients
  - No HTTP server is started

- **SSE** (Server-Sent Events): For web-based clients and HTTP-based integrations
  - Starts an HTTP server that clients can connect to
  - Useful for web applications and services that need real-time updates
  - Requires port mapping when using Docker

### Using SSE Transport

To use the SSE transport protocol:

1. **With direct execution**:

   ```bash
   # Set the transport protocol to SSE
   TRANSPORT_PROTOCOL=sse python -m searxng_simple_mcp.server

   # Or with FastMCP
   fastmcp run src/searxng_simple_mcp/server.py --transport sse
   ```

2. **With Docker**:

   ```bash
   # Run with SSE transport protocol
   docker run -p 8000:8000 -e TRANSPORT_PROTOCOL=sse -e SEARXNG_MCP_SEARXNG_URL=https://your-instance.example.com ghcr.io/sacode/searxng-simple-mcp:latest
   ```

3. **With Docker Compose** (from the included `docker-compose.yml`):

   ```yaml
   environment:
     - SEARXNG_MCP_SEARXNG_URL=https://searx.info
     - SEARXNG_MCP_TIMEOUT=10
     - SEARXNG_MCP_MAX_RESULTS=20
     - SEARXNG_MCP_LANGUAGE=all
     - TRANSPORT_PROTOCOL=sse # Transport protocol: stdio or sse
   ```

When using SSE, the server will be accessible via HTTP at `http://localhost:8000` by default.

To connect to the SSE server from an MCP client, use a configuration like:

```json
{
  "mcpServers": {
    "searxng": {
      "url": "http://localhost:8000",
      "transport": "sse"
    }
  }
}
```

**Note:** Not all applications support the SSE transport protocol. Make sure your MCP client is compatible with SSE before using this transport method.

## Development

For development and testing:

```bash
# Install dependencies
uv pip install -e .

# Run linter and formatter
ruff check .
ruff check --fix .
ruff format .

# Run the server directly
python -m src.searxng_simple_mcp.server

# OR using FastMCP
fastmcp run src/searxng_simple_mcp/server.py  # Use stdio transport (default)
fastmcp run src/searxng_simple_mcp/server.py --transport sse  # Use sse transport

# Run in development mode (launches MCP Inspector)
fastmcp dev src/searxng_simple_mcp/server.py
```

## Publishing to PyPI

For maintainers who need to publish new versions of the package to PyPI:

```bash
# Install development dependencies
npm run install:deps

# Clean, build, and check the package
npm run build:package
npm run check:package

# Publish to PyPI (requires PyPI credentials)
npm run publish:pypi

# Alternatively, use the all-in-one commands to update version and publish
npm run publish:patch  # Increments patch version (1.0.1 -> 1.0.2)
npm run publish:minor  # Increments minor version (1.0.1 -> 1.1.0)
npm run publish:major  # Increments major version (1.0.1 -> 2.0.0)
```

These commands will:

1. Update the version in both package.json and pyproject.toml
2. Clean the dist directory to remove old builds
3. Build the package (creating wheel and source distribution)
4. Check the package for errors
5. Upload the package to PyPI

You'll need to have a PyPI account and be authenticated with twine. You can set up authentication by:

- Creating a `.pypirc` file in your home directory
- Using environment variables (`TWINE_USERNAME` and `TWINE_PASSWORD`)
- Using PyPI API tokens (recommended)

## Docker Configuration

When using Docker with MCP servers, keep these points in mind:

1. **Integration with MCP clients**: Use the configuration shown in the [Using with Docker](#using-with-docker-no-installation-required) section for integrating with Claude Desktop or other MCP-compliant clients.

2. **Transport protocols**:

   - By default, the Docker container uses the stdio transport protocol
   - For SSE transport, see the [Using SSE Transport](#using-sse-transport) section

3. **Configuration options**:

   - Use an environment file (.env) to configure the server: `docker run --env-file .env ...`
   - Pass individual environment variables with the `-e` flag: `docker run -e SEARXNG_MCP_SEARXNG_URL=https://example.com ...`
   - See the [Configuration](#configuration) section for available environment variables

4. **Networking**:
   - Use `--network=host` when you need to access services on your host machine
   - Use `-p 8000:8000` when exposing the SSE server to your network

## Package Structure

```
searxng-simple-mcp/
├── src/
│   ├── run_server.py         # Entry point script
│   └── searxng_simple_mcp/   # Main package
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile                # Docker configuration
└── pyproject.toml            # Python project configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
