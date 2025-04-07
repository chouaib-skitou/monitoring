const express = require('express');
const fs = require('fs');
const path = require('path');
const client = require('prom-client');

const app = express();

// ─── Metrics ─────────────────────
const register = client.register;

const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// ─── File Logging ────────────────
const logPath = path.join(__dirname, 'logs', 'app.log');
fs.mkdirSync(path.dirname(logPath), { recursive: true });
const logStream = fs.createWriteStream(logPath, { flags: 'a' });

function log(data) {
  const entry = JSON.stringify(data);
  logStream.write(entry + '\n');
  console.log(entry);
}

// ─── Middleware ─────────────────
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    // Log the request
    log({
      timestamp: new Date().toISOString(),
      method: req.method,
      route: req.originalUrl,
      status_code: res.statusCode,
      duration_ms: duration,
      message: `Handled ${req.method} ${req.originalUrl}`
    });

    // Increment Prometheus metric
    httpRequests.inc({
      method: req.method,
      route: req.originalUrl,
      status_code: res.statusCode
    });
  });

  next();
});

// ─── Routes ─────────────────────
app.get('/', (req, res) => {
  res.send('Hello from analytics-app!');
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ─── Start Server ───────────────
const port = 3000;
app.listen(port, () => {
  log({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: `Analytics app running on http://localhost:${port}`
  });
});
