// middleware/auth.js
const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  // Try to get token from multiple sources:
  // 1. Authorization header (Bearer token)
  const header = req.headers.authorization || '';
  let token = header.startsWith('Bearer ') ? header.slice(7) : null;
  
  // 2. Query parameter (for OAuth callbacks)
  if (!token && req.query?.token) {
    token = req.query.token;
  }
  
  // 3. Cookie (for OAuth callbacks)
  if (!token && req.cookies?.tg_token) {
    token = req.cookies.tg_token;
  }
  
  console.log('🔑 authRequired - Token present:', !!token, 'Source:', 
    header.startsWith('Bearer ') ? 'header' : 
    req.query?.token ? 'query' : 
    req.cookies?.tg_token ? 'cookie' : 'none');
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, email }
    console.log('✅ Token verified - User:', payload);
    return next();
  } catch (e) {
    console.error('❌ Token verification failed:', e.message);
    return res.status(401).json({ message: 'Invalid token', error: e.message });
  }
}

function isAdmin(req, res, next) {
  console.log('🔐 isAdmin check - User:', req.user);
  console.log('🔐 isAdmin check - Role:', req.user?.role);
  if (req.user?.role === 'ADMIN') {
    console.log('✅ Admin access granted');
    return next();
  }
  console.log('❌ Admin access denied - User role:', req.user?.role);
  return res.status(403).json({ message: 'Forbidden - Admin access required', userRole: req.user?.role });
}

function isStaff(req, res, next) {
  const allowedRoles = ['ADMIN', 'STAFF'];
  if (req.user?.role && allowedRoles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden - Staff access required', userRole: req.user?.role });
}

function isEditor(req, res, next) {
  const allowedRoles = ['ADMIN', 'EDITOR'];
  if (req.user?.role && allowedRoles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden - Editor access required', userRole: req.user?.role });
}

function isAdminOrStaff(req, res, next) {
  const allowedRoles = ['ADMIN', 'STAFF'];
  if (req.user?.role && allowedRoles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden - Admin or Staff access required', userRole: req.user?.role });
}

module.exports = { authRequired, isAdmin, isStaff, isEditor, isAdminOrStaff };