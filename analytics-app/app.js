import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import client from 'prom-client';

const app = express();
const register = client.register;

// ─── Metrics ─────────────────────
const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// ─── Logging Setup ───────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logPath = join(__dirname, 'logs', 'app.log');

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

    log({
      timestamp: new Date().toISOString(),
      method: req.method,
      route: req.originalUrl,
      status_code: res.statusCode,
      duration_ms: duration,
      message: `Handled ${req.method} ${req.originalUrl}`
    });

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

export { app, logStream };
