/* global console */
// Test script for the map tool
import { FirecrawlClient } from 'firecrawl-simple-client';

async function testMap() {
  try {
    console.log('Testing map tool...');
    const client = new FirecrawlClient({
      apiUrl: 'http://localhost:3002/v1',
    });

    const result = await client.generateSitemap({
      url: 'https://example.com',
      limit: 5,
    });

    console.log('Map result:', JSON.stringify(result, null, 2));
    console.log('Map test completed successfully!');
  } catch (error) {
    console.error('Error testing map tool:', error);
  }
}

testMap();
