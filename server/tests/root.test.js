const request = require('supertest');
const app = require('../app');

describe('Root routes', () => {
  it('GET /api should return JSON', async () => {
    const res = await request(app).get('/api');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();      
  });

  it('GET / should serve index.html', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('<html');
  });
});


