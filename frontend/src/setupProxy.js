const { createProxyMiddleware } = require('http-proxy-middleware');

// Track error counts to avoid spam
const errorCounts = new Map();
const MAX_ERROR_LOGS = 5; // Only log first 5 errors per endpoint

module.exports = function(app) {
  // Proxy API requests
  // Use REACT_APP_BACKEND_URL if set (for Dev Tunnels), otherwise use 127.0.0.1 (IPv4)
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:3000';
  console.log('🔗 Frontend proxy target:', backendUrl);
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: backendUrl,
      changeOrigin: true,
      secure: backendUrl.startsWith('https'), // Use secure for HTTPS URLs
      logLevel: 'silent', // Completely silent - we handle errors ourselves
      timeout: 30000, // Increased timeout
      proxyTimeout: 30000,
      ws: true, // Enable websocket support
      xfwd: true,
      // Suppress all default error logging
      onProxyError: (err, req, res) => {
        // This catches errors before they're logged by HPM
        // Completely suppress ECONNRESET
        if (err.code === 'ECONNRESET') {
          return;
        }
        // Only handle if res is valid and response hasn't been sent
        if (res && typeof res.status === 'function' && !res.headersSent) {
          try {
            res.status(503).json({ 
              message: 'Backend connection error',
              error: err.code || err.message
            });
          } catch (responseError) {
            // Silently ignore response errors
          }
        }
      },
      onProxyReq: (proxyReq, req, res) => {
        // Only log important requests, not every one
        if (req.url.includes('/auth/user') || req.url.includes('/destination/featured')) {
          // Suppress frequent polling requests
          return;
        }
      },
      onError: (err, req, res) => {
        // Completely suppress ECONNRESET errors - they're just noise
        // These happen when connections are closed prematurely but don't indicate real problems
        if (err.code === 'ECONNRESET') {
          // Silently handle - don't log or respond
          return;
        }
        
        const errorKey = `${req.method}:${req.url}`;
        const count = errorCounts.get(errorKey) || 0;
        
        // Only log first few errors to avoid spam
        if (count < MAX_ERROR_LOGS) {
          if (err.code === 'ECONNREFUSED') {
            // Backend is down or not responding
            if (count === 0) {
              console.warn(`[PROXY] Backend không khả dụng (${err.code}). Đảm bảo backend đang chạy trên port 3000.`);
            }
          } else if (err.code !== 'ECONNRESET') {
            // Only log non-ECONNRESET errors
            console.error(`[PROXY ERROR] ${err.code}: ${err.message}`);
          }
          errorCounts.set(errorKey, count + 1);
        }
        
        // Check if res is a valid Express response object before using it
        if (res && typeof res.status === 'function' && !res.headersSent && err.code !== 'ECONNRESET') {
          try {
            res.status(503).json({ 
              message: 'Backend server không khả dụng. Vui lòng đảm bảo backend đang chạy trên port 3000.',
              error: err.code || err.message,
              hint: 'Chạy: npm start hoặc npm run dev (từ thư mục gốc)'
            });
          } catch (responseError) {
            // Silently ignore response errors
          }
        }
      },
      onProxyRes: (proxyRes, req, res) => {
        // Reset error count on success
        const errorKey = `${req.method}:${req.url}`;
        if (errorCounts.has(errorKey)) {
          errorCounts.delete(errorKey);
        }
      }
    })
  );

  // Proxy uploads folder for images
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: 'http://127.0.0.1:3000', // Backend runs on port 3000 (use IPv4)
      changeOrigin: true,
      secure: false,
      logLevel: 'silent', // Suppress all logging
      timeout: 10000,
      proxyTimeout: 10000,
      onError: (err, req, res) => {
        // Completely suppress ECONNRESET for uploads too
        if (err.code === 'ECONNRESET') {
          return;
        }
        // Suppress upload errors unless critical
        if (err.code !== 'ECONNREFUSED') {
          console.error('[UPLOAD PROXY ERROR]', err.message);
        }
        // Check if res is valid before using it
        if (res && typeof res.status === 'function' && !res.headersSent) {
          try {
            res.status(503).json({ message: 'Upload service không khả dụng' });
          } catch (responseError) {
            // Silently ignore response errors
          }
        }
      }
    })
  );
};

