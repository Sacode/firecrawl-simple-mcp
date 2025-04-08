/**
 * Simplified error handling for the Firecrawl Simple MCP server
 */

import { ContentResult } from 'fastmcp';
import { formatErrorMessage } from './error';
import logger from './logger';

/**
 * Handle errors in MCP tools consistently
 * @param error The error to handle
 * @param context The error context
 * @returns A formatted MCP tool response with error information
 */
export function handleError(
  error: unknown,
  context: { toolName: string; operation?: string; input?: unknown },
): ContentResult {
  // Log the error with context
  const contextStr = context.operation ? ` during ${context.operation}` : '';
  logger.error(`Error in ${context.toolName}${contextStr}`, error, {
    toolName: context.toolName,
    operation: context.operation,
    input: context.input,
  });

  // Format the error message
  const errorMessage = formatErrorMessage(error);

  // Return a standardized error response
  return {
    content: [
      {
        type: 'text',
        text: errorMessage,
      },
    ],
    isError: true,
  };
}
