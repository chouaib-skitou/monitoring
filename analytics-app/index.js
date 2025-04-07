const express = require('express');
const client = require('prom-client');

const app = express();
const register = client.register;

// Create a custom counter metric
const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Middleware to count requests
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequests.inc({
      method: req.method,
      route: req.path,
      status_code: res.statusCode
    });
  });
  next();
});

app.get('/', (req, res) => {
  res.send('Hello from analytics-app!');
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

const port = 3000;
app.listen(port, () => {
  console.log(`Analytics app running on http://localhost:${port}`);
});
