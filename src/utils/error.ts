/**
 * Simplified error handling utilities for the Firecrawl Simple MCP server
 */
import { UserError } from 'fastmcp';
import logger from './logger';

/**
 * Error types that can be handled
 */
export enum ErrorType {
  VALIDATION = 'validation',
  API = 'api',
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

/**
 * Format an error for MCP response
 * @param error The error to format
 * @returns Formatted error message
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;

    // Check for specific error types based on message content
    if (message.toLowerCase().includes('validation')) {
      return `Validation Error: ${message}`;
    }

    if (message.toLowerCase().includes('api')) {
      return `API Error: ${message}`;
    }

    if (isNetworkError(error)) {
      return `Network Error: ${message}. Please check your connection and try again.`;
    }

    if (isTimeoutError(error)) {
      return `Timeout Error: ${message}. Please try again with a longer timeout or a simpler request.`;
    }

    return `Error: ${message}`;
  }

  return 'An unknown error occurred';
}

/**
 * Create a UserError from any error type
 * @param error The original error
 * @param context Additional context for the error
 * @returns A UserError instance
 */
export function createUserError(
  error: unknown,
  context?: { toolName?: string; operation?: string },
): UserError {
  const message = formatErrorMessage(error);
  const contextStr = context
    ? `${context.toolName ? ` in ${context.toolName}` : ''}${context.operation ? ` during ${context.operation}` : ''}`
    : '';

  // Log the error with context
  logger.error({ err: error, ...context }, `Error${contextStr}`);

  // Return a UserError that FastMCP can handle properly
  return new UserError(message);
}

/**
 * Check if an error is a network error
 */
function isNetworkError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('econnrefused') ||
    message.includes('econnreset') ||
    message.includes('socket hang up') ||
    message.includes('network')
  );
}

/**
 * Check if an error is a timeout error
 */
function isTimeoutError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('timeout') || message.includes('timed out') || message.includes('etimedout')
  );
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
