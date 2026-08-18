const prisma = require('../utils/prisma');

const getReportSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, month, year } = req.query;

    let rangeStart;
    let rangeEnd;

    const now = new Date();
    const selectedMonth = parseInt(month, 10) || (now.getMonth() + 1);
    const selectedYear = parseInt(year, 10) || now.getFullYear();

    if (startDate && endDate) {
      rangeStart = new Date(startDate);
      rangeEnd = new Date(endDate);
      rangeEnd.setHours(23, 59, 59, 999);
    } else {
      rangeStart = new Date(selectedYear, selectedMonth - 1, 1);
      rangeEnd = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
    }

    // Total income and total expense for target range
    const incomeAgg = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'INCOME',
        date: { gte: rangeStart, lte: rangeEnd }
      },
      _sum: { amount: true }
    });

    const expenseAgg = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: rangeStart, lte: rangeEnd }
      },
      _sum: { amount: true }
    });

    const totalIncome = incomeAgg._sum.amount || 0;
    const totalExpense = expenseAgg._sum.amount || 0;
    const netBalance = totalIncome - totalExpense;

    // Expense breakdown by category for pie chart
    const expenseTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: rangeStart, lte: rangeEnd }
      },
      include: {
        category: { select: { id: true, name: true, color: true, icon: true } }
      }
    });

    const categoryMap = {};
    expenseTransactions.forEach((t) => {
      const catName = t.category ? t.category.name : 'Uncategorized';
      const color = t.category ? t.category.color : '#94a3b8';
      if (!categoryMap[catName]) {
        categoryMap[catName] = { name: catName, value: 0, color };
      }
      categoryMap[catName].value += t.amount;
    });

    const categoryBreakdown = Object.values(categoryMap).map((cat) => ({
      ...cat,
      value: Math.round(cat.value * 100) / 100
    }));

    // 6-Month Income vs Expense trend (last 6 calendar months ending on target range end month)
    const trends = [];
    for (let i = 5; i >= 0; i--) {
      const mDate = new Date(selectedYear, selectedMonth - 1 - i, 1);
      const mStart = new Date(mDate.getFullYear(), mDate.getMonth(), 1);
      const mEnd = new Date(mDate.getFullYear(), mDate.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthName = mStart.toLocaleString('default', { month: 'short', year: '2-digit' });

      const [inc, exp] = await Promise.all([
        prisma.transaction.aggregate({
          where: { userId, type: 'INCOME', date: { gte: mStart, lte: mEnd } },
          _sum: { amount: true }
        }),
        prisma.transaction.aggregate({
          where: { userId, type: 'EXPENSE', date: { gte: mStart, lte: mEnd } },
          _sum: { amount: true }
        })
      ]);

      trends.push({
        month: monthName,
        income: inc._sum.amount || 0,
        expense: exp._sum.amount || 0,
        net: (inc._sum.amount || 0) - (exp._sum.amount || 0)
      });
    }

    // Recent 5 transactions widget
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        category: { select: { name: true, color: true, icon: true } }
      },
      orderBy: { date: 'desc' },
      take: 5
    });

    res.json({
      range: {
        startDate: rangeStart,
        endDate: rangeEnd
      },
      month: selectedMonth,
      year: selectedYear,
      summary: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpense: Math.round(totalExpense * 100) / 100,
        netBalance: Math.round(netBalance * 100) / 100
      },
      categoryBreakdown,
      trends,
      recentTransactions
    });
  } catch (err) {
    console.error('Report summary error:', err);
    res.status(500).json({ error: 'Failed to compute financial summary report.' });
  }
};

module.exports = { getReportSummary };
