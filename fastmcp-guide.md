# FastMCP Guide

FastMCP is a TypeScript framework for building [Model Context Protocol (MCP)](https://glama.ai/mcp) servers capable of handling client sessions. This guide provides an overview of its features and usage.

## Features

- Simple Tool, Resource, Prompt definition
- Authentication
- Sessions
- Image content
- Logging
- Error handling
- SSE (Server-Sent Events)
- CORS (enabled by default)
- Progress notifications
- Typed server events
- Prompt argument auto-completion
- Sampling
- Automated SSE pings
- Roots
- CLI for testing and debugging

## Installation

```shell
npm install fastmcp
```

## Quickstart

```ts
import { FastMCP } from 'fastmcp';
import { z } from 'zod'; // Or any validation library that supports Standard Schema

const server = new FastMCP({
  name: 'My Server',
  version: '1.0.0',
});

server.addTool({
  name: 'add',
  description: 'Add two numbers',
  parameters: z.object({
    a: z.number(),
    b: z.number(),
  }),
  execute: async args => {
    return String(args.a + args.b);
  },
});

server.start({
  transportType: 'stdio',
});
```

You can test the server in terminal with:

```shell
git clone https://github.com/punkpeye/fastmcp.git
cd fastmcp

npm install

# Test the addition server example using CLI:
npx fastmcp dev src/examples/addition.ts
# Test the addition server example using MCP Inspector:
npx fastmcp inspect src/examples/addition.ts
```

### SSE Support

You can also run the server with SSE support:

```ts
server.start({
  transportType: 'sse',
  sse: {
    endpoint: '/sse',
    port: 8080,
  },
});
```

## Core Concepts

### Tools

Tools in MCP allow servers to expose executable functions that can be invoked by clients and used by LLMs to perform actions.

FastMCP uses the [Standard Schema](https://standardschema.dev) specification for defining tool parameters. This allows you to use your preferred schema validation library (like Zod, ArkType, or Valibot) as long as it implements the spec.

**Zod Example:**

```ts
import { z } from 'zod';

server.addTool({
  name: 'fetch-zod',
  description: 'Fetch the content of a url (using Zod)',
  parameters: z.object({
    url: z.string(),
  }),
  execute: async args => {
    return await fetchWebpageContent(args.url);
  },
});
```

**ArkType Example:**

```ts
import { type } from 'arktype';

server.addTool({
  name: 'fetch-arktype',
  description: 'Fetch the content of a url (using ArkType)',
  parameters: type({
    url: 'string',
  }),
  execute: async args => {
    return await fetchWebpageContent(args.url);
  },
});
```

**Valibot Example:**

Valibot requires the peer dependency @valibot/to-json-schema.

```ts
import * as v from 'valibot';

server.addTool({
  name: 'fetch-valibot',
  description: 'Fetch the content of a url (using Valibot)',
  parameters: v.object({
    url: v.string(),
  }),
  execute: async args => {
    return await fetchWebpageContent(args.url);
  },
});
```

#### Returning a string

`execute` can return a string:

```js
server.addTool({
  name: 'download',
  description: 'Download a file',
  parameters: z.object({
    url: z.string(),
  }),
  execute: async args => {
    return 'Hello, world!';
  },
});
```

The latter is equivalent to:

```js
server.addTool({
  name: 'download',
  description: 'Download a file',
  parameters: z.object({
    url: z.string(),
  }),
  execute: async args => {
    return {
      content: [
        {
          type: 'text',
          text: 'Hello, world!',
        },
      ],
    };
  },
});
```

#### Returning a list

If you want to return a list of messages, you can return an object with a `content` property:

```js
server.addTool({
  name: 'download',
  description: 'Download a file',
  parameters: z.object({
    url: z.string(),
  }),
  execute: async args => {
    return {
      content: [
        { type: 'text', text: 'First message' },
        { type: 'text', text: 'Second message' },
      ],
    };
  },
});
```

#### Returning an image

Use the `imageContent` to create a content object for an image:

```js
import { imageContent } from 'fastmcp';

server.addTool({
  name: 'download',
  description: 'Download a file',
  parameters: z.object({
    url: z.string(),
  }),
  execute: async args => {
    return imageContent({
      url: 'https://example.com/image.png',
    });

    // or...
    // return imageContent({
    //   path: "/path/to/image.png",
    // });

    // or...
    // return imageContent({
    //   buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64"),
    // });

    // or...
    // return {
    //   content: [
    //     await imageContent(...)
    //   ],
    // };
  },
});
```

#### Logging

Tools can log messages to the client using the `log` object in the context object:

```js
server.addTool({
  name: 'download',
  description: 'Download a file',
  parameters: z.object({
    url: z.string(),
  }),
  execute: async (args, { log }) => {
    log.info('Downloading file...', {
      url,
    });

    // ...

    log.info('Downloaded file');

    return 'done';
  },
});
```

The `log` object has the following methods:

- `debug(message: string, data?: SerializableValue)`
- `error(message: string, data?: SerializableValue)`
- `info(message: string, data?: SerializableValue)`
- `warn(message: string, data?: SerializableValue)`

#### Errors

The errors that are meant to be shown to the user should be thrown as `UserError` instances:

```js
import { UserError } from 'fastmcp';

server.addTool({
  name: 'download',
  description: 'Download a file',
  parameters: z.object({
    url: z.string(),
  }),
  execute: async args => {
    if (args.url.startsWith('https://example.com')) {
      throw new UserError('This URL is not allowed');
    }

    return 'done';
  },
});
```

#### Progress

Tools can report progress by calling `reportProgress` in the context object:

```js
server.addTool({
  name: 'download',
  description: 'Download a file',
  parameters: z.object({
    url: z.string(),
  }),
  execute: async (args, { reportProgress }) => {
    reportProgress({
      progress: 0,
      total: 100,
    });

    // ...

    reportProgress({
      progress: 100,
      total: 100,
    });

    return 'done';
  },
});
```

### Resources

Resources represent any kind of data that an MCP server wants to make available to clients. This can include:

- File contents
- Screenshots and images
- Log files
- And more

Each resource is identified by a unique URI and can contain either text or binary data.

```ts
server.addResource({
  uri: 'file:///logs/app.log',
  name: 'Application Logs',
  mimeType: 'text/plain',
  async load() {
    return {
      text: await readLogFile(),
    };
  },
});
```

`load` can return multiple resources:

```ts
async load() {
  return [
    {
      text: "First file content",
    },
    {
      text: "Second file content",
    },
  ];
}
```

You can also return binary contents in `load`:

```ts
async load() {
  return {
    blob: 'base64-encoded-data'
  };
}
```

### Resource templates

You can also define resource templates:

```ts
server.addResourceTemplate({
  uriTemplate: 'file:///logs/{name}.log',
  name: 'Application Logs',
  mimeType: 'text/plain',
  arguments: [
    {
      name: 'name',
      description: 'Name of the log',
      required: true,
    },
  ],
  async load({ name }) {
    return {
      text: `Example log content for ${name}`,
    };
  },
});
```

#### Resource template argument auto-completion

Provide `complete` functions for resource template arguments to enable automatic completion:

```ts
server.addResourceTemplate({
  uriTemplate: 'file:///logs/{name}.log',
  name: 'Application Logs',
  mimeType: 'text/plain',
  arguments: [
    {
      name: 'name',
      description: 'Name of the log',
      required: true,
      complete: async value => {
        if (value === 'Example') {
          return {
            values: ['Example Log'],
          };
        }

        return {
          values: [],
        };
      },
    },
  ],
  async load({ name }) {
    return {
      text: `Example log content for ${name}`,
    };
  },
});
```

### Prompts

Prompts enable servers to define reusable prompt templates and workflows that clients can easily surface to users and LLMs. They provide a powerful way to standardize and share common LLM interactions.

```ts
server.addPrompt({
  name: 'git-commit',
  description: 'Generate a Git commit message',
  arguments: [
    {
      name: 'changes',
      description: 'Git diff or description of changes',
      required: true,
    },
  ],
  load: async args => {
    return `Generate a concise but descriptive commit message for these changes:\n\n${args.changes}`;
  },
});
```

#### Prompt argument auto-completion

Prompts can provide auto-completion for their arguments:

```js
server.addPrompt({
  name: 'countryPoem',
  description: 'Writes a poem about a country',
  load: async ({ name }) => {
    return `Hello, ${name}!`;
  },
  arguments: [
    {
      name: 'name',
      description: 'Name of the country',
      required: true,
      complete: async value => {
        if (value === 'Germ') {
          return {
            values: ['Germany'],
          };
        }

        return {
          values: [],
        };
      },
    },
  ],
});
```

#### Prompt argument auto-completion using `enum`

If you provide an `enum` array for an argument, the server will automatically provide completions for the argument.

```js
server.addPrompt({
  name: 'countryPoem',
  description: 'Writes a poem about a country',
  load: async ({ name }) => {
    return `Hello, ${name}!`;
  },
  arguments: [
    {
      name: 'name',
      description: 'Name of the country',
      required: true,
      enum: ['Germany', 'France', 'Italy'],
    },
  ],
});
```

### Authentication

FastMCP allows you to `authenticate` clients using a custom function:

```ts
import { AuthError } from 'fastmcp';

const server = new FastMCP({
  name: 'My Server',
  version: '1.0.0',
  authenticate: ({ request }) => {
    const apiKey = request.headers['x-api-key'];

    if (apiKey !== '123') {
      throw new Response(null, {
        status: 401,
        statusText: 'Unauthorized',
      });
    }

    // Whatever you return here will be accessible in the `context.session` object.
    return {
      id: 1,
    };
  },
});
```

Now you can access the authenticated session data in your tools:

```ts
server.addTool({
  name: 'sayHello',
  execute: async (args, { session }) => {
    return `Hello, ${session.id}!`;
  },
});
```

### Sessions

The `session` object is an instance of `FastMCPSession` and it describes active client sessions.

```ts
server.sessions;
```

We allocate a new server instance for each client connection to enable 1:1 communication between a client and the server.

### Typed server events

You can listen to events emitted by the server using the `on` method:

```ts
server.on('connect', event => {
  console.log('Client connected:', event.session);
});

server.on('disconnect', event => {
  console.log('Client disconnected:', event.session);
});
```

## FastMCPSession

`FastMCPSession` represents a client session and provides methods to interact with the client.

### `requestSampling`

`requestSampling` creates a sampling request and returns the response.

```ts
await session.requestSampling({
  messages: [
    {
      role: 'user',
      content: {
        type: 'text',
        text: 'What files are in the current directory?',
      },
    },
  ],
  systemPrompt: 'You are a helpful file system assistant.',
  includeContext: 'thisServer',
  maxTokens: 100,
});
```

### `clientCapabilities`

The `clientCapabilities` property contains the client capabilities.

```ts
session.clientCapabilities;
```

### `loggingLevel`

The `loggingLevel` property describes the logging level as set by the client.

```ts
session.loggingLevel;
```

### `roots`

The `roots` property contains the roots as set by the client.

```ts
session.roots;
```

### `server`

The `server` property contains an instance of MCP server that is associated with the session.

```ts
session.server;
```

### Typed session events

You can listen to events emitted by the session using the `on` method:

```ts
session.on('rootsChanged', event => {
  console.log('Roots changed:', event.roots);
});

session.on('error', event => {
  console.error('Error:', event.error);
});
```

## Running Your Server

### Test with `mcp-cli`

The fastest way to test and debug your server is with `fastmcp dev`:

```shell
npx fastmcp dev server.js
npx fastmcp dev server.ts
```

This will run your server with `mcp-cli` for testing and debugging your MCP server in the terminal.

### Inspect with `MCP Inspector`

Another way is to use the official `MCP Inspector` to inspect your server with a Web UI:

```shell
npx fastmcp inspect server.ts
```

## FAQ

### How to use with Claude Desktop?

Follow the guide [https://modelcontextprotocol.io/quickstart/user](https://modelcontextprotocol.io/quickstart/user) and add the following configuration:

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "npx",
      "args": ["tsx", "/PATH/TO/YOUR_PROJECT/src/index.ts"],
      "env": {
        "YOUR_ENV_VAR": "value"
      }
    }
  }
}
```

## Showcase

If you've developed a server using FastMCP, please [submit a PR](https://github.com/punkpeye/fastmcp) to showcase it here!

- [apinetwork/piapi-mcp-server](https://github.com/apinetwork/piapi-mcp-server) - generate media using Midjourney/Flux/Kling/LumaLabs/Udio/Chrip/Trellis
- [domdomegg/computer-use-mcp](https://github.com/domdomegg/computer-use-mcp) - controls your computer
- [LiterallyBlah/Dradis-MCP](https://github.com/LiterallyBlah/Dradis-MCP) – manages projects and vulnerabilities in Dradis
- [Meeting-Baas/meeting-mcp](https://github.com/Meeting-Baas/meeting-mcp) - create meeting bots, search transcripts, and manage recording data
- [drumnation/unsplash-smart-mcp-server](https://github.com/drumnation/unsplash-smart-mcp-server) – enables AI agents to seamlessly search, recommend, and deliver professional stock photos from Unsplash
- [ssmanji89/halopsa-workflows-mcp](https://github.com/ssmanji89/halopsa-workflows-mcp) - HaloPSA Workflows integration with AI assistants
- [aiamblichus/mcp-chat-adapter](https://github.com/aiamblichus/mcp-chat-adapter) – provides a clean interface for LLMs to use chat completion

## Acknowledgements

- FastMCP is inspired by the [Python implementation](https://github.com/jlowin/fastmcp) by [Jonathan Lowin](https://github.com/jlowin).
- Parts of codebase were adopted from [LiteMCP](https://github.com/wong2/litemcp).
- Parts of codebase were adopted from [Model Context protocolでSSEをやってみる](https://dev.classmethod.jp/articles/mcp-sse/).
