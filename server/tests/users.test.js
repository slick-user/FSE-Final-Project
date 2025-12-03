jest.mock('../config/db.js', () => ({
  connectDB: jest.fn()
}));

jest.mock('../models/User.js', () => require('./models').User);

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$10$hashedpassword'),
  compare: jest.fn().mockResolvedValue(true) // Always return true for tests
}));

const request = require('supertest');
const app = require('../app');

describe('User API Routes', () => {
  it('POST /api/register should register a new user', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ name: 'Bob', rollNo: 'R2', password: 'pass123', role: 'student', disability: false });

    expect(res.statusCode === 201 || res.statusCode === 200).toBeTruthy();
    expect(res.body.success).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.name).toBe('Bob');

  });

  it('POST /api/login should login existing user', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ rollNo: 'R1', password: 'pass123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.user.rollNo).toBe('R1');

  });
});
