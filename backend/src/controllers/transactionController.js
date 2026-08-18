const { Parser } = require('json2csv');
const prisma = require('../utils/prisma');

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      categoryId,
      type,
      search
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where = { userId };

    if (type && ['INCOME', 'EXPENSE'].includes(type.toUpperCase())) {
      where.type = type.toUpperCase();
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        where.date.lte = eDate;
      }
    }

    if (search && search.trim() !== '') {
      where.description = {
        contains: search.trim()
      };
    }

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, icon: true, color: true }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limitNum
      })
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.json({
      transactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
};

const createTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount, type, categoryId, description, date } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Valid positive amount is required.' });
    }

    if (!type || !['INCOME', 'EXPENSE'].includes(type.toUpperCase())) {
      return res.status(400).json({ error: 'Type must be either INCOME or EXPENSE.' });
    }

    if (!categoryId) {
      return res.status(400).json({ error: 'Category ID is required.' });
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(400).json({ error: 'Selected category does not exist.' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: parseFloat(amount),
        type: type.toUpperCase(),
        categoryId,
        description: description ? description.trim() : '',
        date: date ? new Date(date) : new Date()
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true }
        }
      }
    });

    res.status(201).json({ transaction });
  } catch (err) {
    console.error('Create transaction error:', err);
    res.status(500).json({ error: 'Failed to create transaction.' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { amount, type, categoryId, description, date } = req.body;

    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized.' });
    }

    const data = {};

    if (amount !== undefined) {
      if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: 'Valid positive amount is required.' });
      }
      data.amount = parseFloat(amount);
    }

    if (type !== undefined) {
      if (!['INCOME', 'EXPENSE'].includes(type.toUpperCase())) {
        return res.status(400).json({ error: 'Type must be INCOME or EXPENSE.' });
      }
      data.type = type.toUpperCase();
    }

    if (categoryId !== undefined) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return res.status(400).json({ error: 'Selected category does not exist.' });
      }
      data.categoryId = categoryId;
    }

    if (description !== undefined) {
      data.description = description.trim();
    }

    if (date !== undefined) {
      data.date = new Date(date);
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data,
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true }
        }
      }
    });

    res.json({ transaction: updated });
  } catch (err) {
    console.error('Update transaction error:', err);
    res.status(500).json({ error: 'Failed to update transaction.' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized.' });
    }

    await prisma.transaction.delete({ where: { id } });

    res.json({ message: 'Transaction deleted successfully.' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ error: 'Failed to delete transaction.' });
  }
};

const exportTransactionsCSV = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, categoryId, type, search } = req.query;

    const where = { userId };

    if (type && ['INCOME', 'EXPENSE'].includes(type.toUpperCase())) {
      where.type = type.toUpperCase();
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        where.date.lte = eDate;
      }
    }

    if (search && search.trim() !== '') {
      where.description = { contains: search.trim() };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: { select: { name: true } }
      },
      orderBy: { date: 'desc' }
    });

    const fields = [
      { label: 'Date', value: row => new Date(row.date).toISOString().split('T')[0] },
      { label: 'Type', value: 'type' },
      { label: 'Category', value: row => row.category ? row.category.name : 'N/A' },
      { label: 'Amount', value: 'amount' },
      { label: 'Description', value: 'description' }
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(transactions);

    res.header('Content-Type', 'text/csv');
    res.attachment(`transactions_${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error('Export CSV error:', err);
    res.status(500).json({ error: 'Failed to export CSV.' });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportTransactionsCSV
};
