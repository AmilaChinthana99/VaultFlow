const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/utils/prisma');

describe('Transaction API Endpoints Unit Tests', () => {
  let token;
  let categoryId;
  let createdTransactionId;

  beforeAll(async () => {
    // Register test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Transaction Tester',
        email: `tx_tester_${Date.now()}@example.com`,
        password: 'password123'
      });

    token = res.body.token;

    // Get categories for user
    const catRes = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`);

    categoryId = catRes.body.categories[0].id;
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: 'tx_tester_' } }
      });
    } catch (e) {}
    await prisma.$disconnect();
  });

  it('POST /api/transactions should create a transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 250.50,
        type: 'EXPENSE',
        categoryId,
        description: 'Grocery test purchase',
        date: new Date().toISOString()
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.transaction).toHaveProperty('id');
    expect(res.body.transaction.amount).toBe(250.50);
    createdTransactionId = res.body.transaction.id;
  });

  it('GET /api/transactions should list transactions with pagination', async () => {
    const res = await request(app)
      .get('/api/transactions?page=1&limit=5')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('transactions');
    expect(res.body.pagination).toHaveProperty('total');
  });

  it('PUT /api/transactions/:id should update an existing transaction', async () => {
    const res = await request(app)
      .put(`/api/transactions/${createdTransactionId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 300.00,
        description: 'Updated Grocery test purchase'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.transaction.amount).toBe(300.00);
    expect(res.body.transaction.description).toBe('Updated Grocery test purchase');
  });

  it('DELETE /api/transactions/:id should delete the transaction', async () => {
    const res = await request(app)
      .delete(`/api/transactions/${createdTransactionId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
