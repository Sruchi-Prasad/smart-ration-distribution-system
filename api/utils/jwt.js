const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.ACCESS_SECRET || 'your-access-secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret';

function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, ACCESS_SECRET, { expiresIn: '15m' });
}

function signRefreshToken(user, jti) {
  return jwt.sign({ sub: user._id.toString(), jti }, REFRESH_SECRET, { expiresIn: '7d' });
}

function verifyAccess(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function verifyRefresh(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = { signAccessToken, signRefreshToken, verifyAccess, verifyRefresh };