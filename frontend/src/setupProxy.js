const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      timeout: 10000,
      proxyTimeout: 10000,
      onProxyReq: (proxyReq, req, res) => {
        console.log(`[PROXY] ${req.method} ${req.url} -> http://localhost:3000${req.url}`);
      },
      onError: (err, req, res) => {
        console.error('[PROXY ERROR]', err.message);
        console.error('[PROXY ERROR] Backend should be running on http://localhost:3000');
        console.error('[PROXY ERROR] Full error:', err);
        if (!res.headersSent) {
          res.status(503).json({ 
            message: 'Backend server không khả dụng. Vui lòng đảm bảo backend đang chạy trên port 3000.',
            error: err.message,
            hint: 'Chạy: npm start (từ thư mục gốc)'
          });
        }
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`[PROXY SUCCESS] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
      }
    })
  );

  // Proxy uploads folder for images
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
      logLevel: 'warn',
      timeout: 5000,
      proxyTimeout: 5000,
    })
  );
};

