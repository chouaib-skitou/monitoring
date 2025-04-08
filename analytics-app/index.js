import { app, logStream } from './app.js';

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Analytics app running on http://localhost:${port}`
    })
  );
});

// Optional: Handle graceful shutdown
process.on('SIGINT', () => {
  logStream.end();
  process.exit(0);
});
