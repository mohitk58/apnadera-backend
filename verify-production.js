// Script to verify production environment variables
console.log('=== Production Environment Verification ===');
console.log('');

// Check if we're in production
if (process.env.NODE_ENV === 'production') {
  console.log('✅ NODE_ENV is set to production');
} else {
  console.log('⚠️  NODE_ENV is not set to production');
  console.log('   Current value:', process.env.NODE_ENV || 'not set');
}

console.log('');

// Check required variables
const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
let allGood = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: configured`);
    // Show masked value for security
    if (varName === 'MONGODB_URI') {
      const masked = value.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
      console.log(`   Value: ${masked}`);
    } else if (varName === 'JWT_SECRET') {
      console.log(`   Value: ${value.substring(0, 10)}...`);
    }
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allGood = false;
  }
});

console.log('');

if (allGood) {
  console.log('🎉 All required environment variables are set!');
  console.log('Your Railway deployment should work correctly now.');
  console.log('');
  console.log('Next steps:');
  console.log('1. Check Railway logs for successful startup');
  console.log('2. Test your health endpoint');
  console.log('3. Test your frontend connection');
} else {
  console.log('❌ Some required environment variables are missing.');
  console.log('Please set them in your Railway dashboard.');
  process.exit(1);
} 