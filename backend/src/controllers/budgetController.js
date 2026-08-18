const prisma = require('../utils/prisma');

const getBudgets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const month = parseInt(req.query.month, 10) || (now.getMonth() + 1);
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const budgets = await prisma.budget.findMany({
      where: { userId, month, year },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true }
        }
      }
    });

    // Compute spent amount for each budget category in selected month/year
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const budgetsWithUsage = await Promise.all(
      budgets.map(async (budget) => {
        const result = await prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            type: 'EXPENSE',
            date: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          },
          _sum: {
            amount: true
          }
        });

        const spent = result._sum.amount || 0;
        const percentage = Math.round((spent / budget.monthlyLimit) * 100);
        const status = percentage >= 100 ? 'EXCEEDED' : percentage >= 90 ? 'WARNING' : 'OK';

        return {
          ...budget,
          spent,
          percentage,
          status
        };
      })
    );

    res.json({
      month,
      year,
      budgets: budgetsWithUsage
    });
  } catch (err) {
    console.error('Get budgets error:', err);
    res.status(500).json({ error: 'Failed to fetch budgets.' });
  }
};

const createOrUpdateBudget = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { categoryId, monthlyLimit, month, year } = req.body;

    if (!categoryId) {
      return res.status(400).json({ error: 'Category ID is required.' });
    }

    if (!monthlyLimit || isNaN(parseFloat(monthlyLimit)) || parseFloat(monthlyLimit) <= 0) {
      return res.status(400).json({ error: 'Valid monthly budget limit is required.' });
    }

    const targetMonth = parseInt(month, 10) || (new Date().getMonth() + 1);
    const targetYear = parseInt(year, 10) || new Date().getFullYear();

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(400).json({ error: 'Category does not exist.' });
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId,
          categoryId,
          month: targetMonth,
          year: targetYear
        }
      },
      update: {
        monthlyLimit: parseFloat(monthlyLimit)
      },
      create: {
        userId,
        categoryId,
        monthlyLimit: parseFloat(monthlyLimit),
        month: targetMonth,
        year: targetYear
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true }
        }
      }
    });

    res.status(201).json({ budget });
  } catch (err) {
    console.error('Create budget error:', err);
    res.status(500).json({ error: 'Failed to set budget.' });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const budget = await prisma.budget.findUnique({ where: { id } });
    if (!budget || budget.userId !== userId) {
      return res.status(404).json({ error: 'Budget not found or unauthorized.' });
    }

    await prisma.budget.delete({ where: { id } });

    res.json({ message: 'Budget removed successfully.' });
  } catch (err) {
    console.error('Delete budget error:', err);
    res.status(500).json({ error: 'Failed to delete budget.' });
  }
};

module.exports = { getBudgets, createOrUpdateBudget, deleteBudget };
