const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  
  return jwt.sign({ id }, secret, {
    expiresIn: '30d'
  });
};

module.exports = generateToken; 