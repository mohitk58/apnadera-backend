// Test script to verify environment variables
require('dotenv').config({ path: './config.env' });

console.log('=== Environment Variable Test ===');
console.log('');

// Check required variables
const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingVars = [];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: configured`);
    // Mask sensitive values
    if (varName === 'MONGODB_URI') {
      console.log(`   Value: ${value.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    } else if (varName === 'JWT_SECRET') {
      console.log(`   Value: ${value.substring(0, 10)}...`);
    }
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    missingVars.push(varName);
  }
});

console.log('');

// Check optional variables
const optionalVars = ['NODE_ENV', 'PORT', 'EMAIL_USER', 'EMAIL_PASS'];
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`ℹ️  ${varName}: ${value}`);
  } else {
    console.log(`⚠️  ${varName}: not set (optional)`);
  }
});

console.log('');

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('');
  console.log('Please set these variables in your production environment.');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are configured!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Deploy to production');
  console.log('2. Test the /health endpoint');
  console.log('3. Check Railway logs for any errors');
} 