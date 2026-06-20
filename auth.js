const { admin, isMockMode } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  if (isMockMode && token.startsWith('mock-')) {
    // Development fallback parsing
    const cleanToken = token.replace('mock-', '');
    const parts = cleanToken.split(':');
    const uid = parts[0] || 'mock-user-uid';
    const email = parts[1] || 'mock-user@example.com';
    req.user = {
      uid,
      email,
      name: email.split('@')[0]
    };
    return next();
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email.split('@')[0]
    };
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error.message);
    return res.status(403).json({ error: 'Unauthorized access', details: error.message });
  }
};

module.exports = verifyToken;
