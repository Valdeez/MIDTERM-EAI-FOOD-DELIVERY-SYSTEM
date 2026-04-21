const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json'); 

const app = express();
const PORT = 3000;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    router: {
        '/api/restaurants': 'http://localhost:3001',
        '/api/menus': 'http://localhost:3001',
        '/api/orders': 'http://localhost:3002',
        '/api/history': 'http://localhost:3002',
        '/api/payments': 'http://localhost:3003',
        '/api/users': 'http://localhost:3004' 
    }
}));

app.listen(PORT, () => console.log(`API Gateway running on http://localhost:${PORT}`));