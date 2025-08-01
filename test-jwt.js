// Test JWT_SECRET functionality
require('dotenv').config({ path: './config.env' });

console.log('=== JWT_SECRET Test ===');
console.log('');

// Check if JWT_SECRET exists
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.log('❌ JWT_SECRET is not set');
  console.log('');
  console.log('Please add JWT_SECRET to your Railway environment variables:');
  console.log('Variable Name: JWT_SECRET');
  console.log('Value: house-price-properties-jwt-secret-key-2024-change-in-production');
  process.exit(1);
}

console.log('✅ JWT_SECRET is configured');
console.log('Value (first 10 chars):', jwtSecret.substring(0, 10) + '...');

// Test JWT token generation
try {
  const jwt = require('jsonwebtoken');
  const testToken = jwt.sign({ test: 'data' }, jwtSecret, { expiresIn: '1h' });
  console.log('✅ JWT token generation works');
  console.log('Test token (first 20 chars):', testToken.substring(0, 20) + '...');
  
  // Test token verification
  const decoded = jwt.verify(testToken, jwtSecret);
  console.log('✅ JWT token verification works');
  console.log('Decoded data:', decoded);
  
} catch (error) {
  console.log('❌ JWT test failed:', error.message);
  process.exit(1);
}

console.log('');
console.log('🎉 JWT_SECRET is working correctly!');
console.log('Your Railway deployment should work now.'); 