const { createProxyMiddleware } = require('http-proxy-middleware');

const proxyTarget = process.env.REACT_APP_API_PROXY || 'http://localhost:4000';

module.exports = function(app) {
  app.use(
    '/api', // or whatever your API route is
    createProxyMiddleware({
      target: proxyTarget,
      changeOrigin: true,
    })
  );
};
