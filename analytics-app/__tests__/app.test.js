// __tests__/app.test.js
import request from 'supertest';
import { app, logStream } from '../app.js';

afterAll(() => {
  logStream.end();
});

describe('Analytics App', () => {
  it('should return 200 on GET /', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Hello');
  });

  it('should expose metrics on /metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('http_requests_total');
  });
});
