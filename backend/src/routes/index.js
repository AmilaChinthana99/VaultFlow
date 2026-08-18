const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const transactionController = require('../controllers/transactionController');
const categoryController = require('../controllers/categoryController');
const budgetController = require('../controllers/budgetController');
const reportController = require('../controllers/reportController');

const { authenticateToken } = require('../middleware/auth');

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticateToken, authController.getMe);

// Transaction routes
router.get('/transactions/export', authenticateToken, transactionController.exportTransactionsCSV);
router.get('/transactions', authenticateToken, transactionController.getTransactions);
router.post('/transactions', authenticateToken, transactionController.createTransaction);
router.put('/transactions/:id', authenticateToken, transactionController.updateTransaction);
router.delete('/transactions/:id', authenticateToken, transactionController.deleteTransaction);

// Category routes
router.get('/categories', authenticateToken, categoryController.getCategories);
router.post('/categories', authenticateToken, categoryController.createCategory);
router.delete('/categories/:id', authenticateToken, categoryController.deleteCategory);

// Budget routes
router.get('/budgets', authenticateToken, budgetController.getBudgets);
router.post('/budgets', authenticateToken, budgetController.createOrUpdateBudget);
router.delete('/budgets/:id', authenticateToken, budgetController.deleteBudget);

// Report routes
router.get('/reports/summary', authenticateToken, reportController.getReportSummary);

module.exports = router;
