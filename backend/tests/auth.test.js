const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/utils/prisma');

describe('Auth Endpoints API Unit Tests', () => {
  const testUser = {
    name: 'Test Finance User',
    email: `test_${Date.now()}@example.com`,
    password: 'password123'
  };

  afterAll(async () => {
    // Clean up test user
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: 'test_' } }
      });
    } catch (e) {}
    await prisma.$disconnect();
  });

  it('POST /api/auth/register should create a new user and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', testUser.email.toLowerCase());
  });

  it('POST /api/auth/register should fail on duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/auth/login should authenticate valid user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('GET /api/auth/me should return profile with valid JWT', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.user).toHaveProperty('email', testUser.email.toLowerCase());
  });
});
