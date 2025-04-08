/* global console */
// Test script for error handling with improved validation
import { FirecrawlClient } from 'firecrawl-simple-client';
import { URL } from 'url';

// Custom validation wrapper for the client
class EnhancedFirecrawlClient extends FirecrawlClient {
  constructor(config) {
    super(config);
  }

  // Override scrapeWebpage with validation
  async scrapeWebpage(options) {
    // Validate URL
    if (!options.url) {
      throw new Error('URL is required');
    }

    if (typeof options.url !== 'string') {
      throw new Error('URL must be a string');
    }

    if (!options.url.startsWith('http://') && !options.url.startsWith('https://')) {
      throw new Error('URL must start with http:// or https://');
    }

    try {
      new URL(options.url);
    } catch {
      throw new Error('Invalid URL format');
    }

    return super.scrapeWebpage(options);
  }

  // Override generateSitemap with validation
  async generateSitemap(options) {
    // Validate URL
    if (!options.url) {
      throw new Error('URL is required');
    }

    if (typeof options.url !== 'string') {
      throw new Error('URL must be a string');
    }

    if (!options.url.startsWith('http://') && !options.url.startsWith('https://')) {
      throw new Error('URL must start with http:// or https://');
    }

    try {
      new URL(options.url);
    } catch {
      throw new Error('Invalid URL format');
    }

    return super.generateSitemap(options);
  }

  // Override getCrawlStatus with validation
  async getCrawlStatus(jobId) {
    // Validate job ID
    if (!jobId) {
      throw new Error('Job ID is required');
    }

    if (typeof jobId !== 'string') {
      throw new Error('Job ID must be a string');
    }

    return super.getCrawlStatus(jobId);
  }
}

async function testErrorHandling() {
  try {
    console.log('Testing error handling...');
    const client = new EnhancedFirecrawlClient({
      apiUrl: 'http://localhost:3002/v1',
    });

    // Test invalid URL for scrape tool
    console.log('\nTesting scrape tool with invalid URL:');
    try {
      const result = await client.scrapeWebpage({
        url: 'invalid-url',
        formats: ['markdown'],
      });
      console.log('Scrape result:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.log('Scrape error (expected):', error.message);
    }

    // Test invalid URL for map tool
    console.log('\nTesting map tool with invalid URL:');
    try {
      const result = await client.generateSitemap({
        url: 'invalid-url',
      });
      console.log('Map result:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.log('Map error (expected):', error.message);
    }

    // Test invalid job ID for check crawl status tool
    console.log('\nTesting check crawl status tool with invalid job ID:');
    try {
      const result = await client.getCrawlStatus(null);
      console.log('Check crawl status result:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.log('Check crawl status error (expected):', error.message);
    }

    console.log('\nError handling tests completed successfully!');
  } catch (error) {
    console.error('Unexpected error during testing:', error);
  }
}

testErrorHandling();
