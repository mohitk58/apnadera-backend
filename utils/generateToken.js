const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    console.warn('⚠️  JWT_SECRET not set, using fallback secret');
  }
  
  return jwt.sign({ id }, secret, {
    expiresIn: '30d'
  });
};

module.exports = generateToken; 