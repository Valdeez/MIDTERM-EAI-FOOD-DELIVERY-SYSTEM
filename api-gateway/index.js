const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = 3000;

// Menggunakan satu proxy utama dengan fitur 'router' agar path tidak terpotong
app.use(createProxyMiddleware({
    target: 'http://localhost:3001', // Target default
    changeOrigin: true,
    router: {
        // Pemetaan otomatis berdasarkan awalan path
        '/api/restaurants': 'http://localhost:3001',
        '/api/menus': 'http://localhost:3001',
        '/api/orders': 'http://localhost:3002',
        '/api/history': 'http://localhost:3002',
        '/api/payments': 'http://localhost:3003'
    }
}));

app.listen(PORT, () => {
    console.log(`API Gateway running on http://localhost:${PORT}`);
});