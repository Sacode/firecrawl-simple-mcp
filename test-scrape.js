// Test script for the scrape tool
import { FirecrawlClient } from 'firecrawl-simple-client';

async function testScrape() {
  try {
    console.log('Testing scrape tool...');
    const client = new FirecrawlClient({
      apiUrl: 'http://localhost:3002/v1'
    });

    const result = await client.scrapeWebpage({
      url: 'https://example.com',
      formats: ['markdown'],
      timeout: 30000
    });

    console.log('Scrape result:', JSON.stringify(result, null, 2));
    console.log('Scrape test completed successfully!');
  } catch (error) {
    console.error('Error testing scrape tool:', error);
  }
}

testScrape();