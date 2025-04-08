/**
 * Tool factory for creating MCP tools with consistent patterns
 */

import { z } from 'zod';
import { ContentResult, Tool, ToolParameters } from 'fastmcp';
import { handleError } from './error-handler';
import logger from './logger';

/**
 * Options for creating a tool
 */
export interface CreateToolOptions<T> {
  name: string;
  description: string;
  schema: z.ZodType<T>;
  execute: (params: T) => Promise<ContentResult>;
}

/**
 * Create an MCP tool with consistent error handling and logging
 * @param options Tool creation options
 * @returns An MCP tool definition
 */
export function createTool<T>({
  name,
  description,
  schema,
  execute,
}: CreateToolOptions<T>): Tool<undefined> {
  return {
    name,
    description,
    parameters: schema as unknown as ToolParameters,
    execute: async (params: unknown): Promise<ContentResult> => {
      try {
        // Parse and validate params with Zod
        const typedParams = schema.parse(params);
        logger.info({ params: typedParams }, `Executing ${name} tool`);

        // Execute the tool-specific logic
        return await execute(typedParams);
      } catch (error) {
        // Handle errors consistently
        return handleError(error, {
          toolName: name,
          operation: 'execution',
        });
      }
    },
  };
}

/**
 * Create a text response for MCP
 * @param text The text content
 * @returns An MCP tool response
 */
export function createTextResponse(text: string): ContentResult {
  return {
    content: [
      {
        type: 'text',
        text,
      },
    ],
    isError: false,
  };
}

/**
 * Create a JSON response for MCP
 * @param data The data to format as JSON
 * @returns An MCP tool response
 */
export function createJsonResponse(data: unknown): ContentResult {
  return createTextResponse(JSON.stringify(data, null, 2));
}
