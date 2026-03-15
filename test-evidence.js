#!/usr/bin/env node
// Test script for Evidence API

const BASE_URL = process.env.API_URL || 'https://safetymap-test-production.up.railway.app';
// Or use localhost: const BASE_URL = 'http://localhost:3000';

async function testEndpoint(url, options = {}) {
  console.log(`\n${options.description || 'Testing:'} ${url}`);
  console.log('Headers:', JSON.stringify(options.headers || {}, null, 2));
  
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    
    console.log('Status:', response.status);
    console.log('Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
      return { status: response.status, data };
    } else {
      const text = await response.text();
      console.log('Response (text):', text.substring(0, 500));
      return { status: response.status, text };
    }
  } catch (error) {
    console.error('Error:', error.message);
    return { error: error.message };
  }
}

async function runTests() {
  console.log('=== SafetyMap Evidence API Tests ===');
  console.log('Base URL:', BASE_URL);

  // Test 1: No token
  await testEndpoint(`${BASE_URL}/api/v1/evidence`, {
    description: 'Test 1: No Authorization (expect 401)'
  });

  // Test 2: Invalid token
  await testEndpoint(`${BASE_URL}/api/v1/evidence`, {
    description: 'Test 2: Invalid token (expect 401/403)',
    headers: { 'Authorization': 'Bearer invalid_token' }
  });

  // Test 3: Health check (no auth required)
  await testEndpoint(`${BASE_URL}/api/health`, {
    description: 'Test 3: Health check (should work)'
  });

  // Test 4: Login (if credentials provided)
  const alias = process.env.TEST_ALIAS;
  const passkey = process.env.TEST_PASSKEY;
  
  if (alias && passkey) {
    console.log('\n=== Testing with credentials ===');
    
    const loginResult = await testEndpoint(`${BASE_URL}/api/mappers/login`, {
      description: 'Test 4: Login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alias, passkey })
    });

    if (loginResult.data?.success && loginResult.data?.data?.token) {
      const token = loginResult.data.data.token;
      console.log('\n✅ Login successful, got token');

      // Test 5: Get evidence with valid token
      await testEndpoint(`${BASE_URL}/api/v1/evidence`, {
        description: 'Test 5: Get evidence with valid token (expect 200)',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } else {
      console.log('\n❌ Login failed, skipping authenticated tests');
    }
  } else {
    console.log('\n=== Skipping authenticated tests ===');
    console.log('Set TEST_ALIAS and TEST_PASSKEY environment variables to test with credentials');
    console.log('Example: TEST_ALIAS=node1 TEST_PASSKEY=secret123 node test-evidence.js');
  }

  console.log('\n=== Tests complete ===');
}

runTests();
