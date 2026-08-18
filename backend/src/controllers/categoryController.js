const prisma = require('../utils/prisma');

const getCategories = async (req, res) => {
  try {
    const userId = req.user.userId;
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId: userId },
          { isDefault: true, userId: null }
        ]
      },
      orderBy: { name: 'asc' }
    });

    res.json({ categories });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
};

const createCategory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, icon, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const existing = await prisma.category.findFirst({
      where: {
        userId,
        name: { equals: name.trim() }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Category with this name already exists.' });
    }

    const category = await prisma.category.create({
      data: {
        userId,
        name: name.trim(),
        icon: icon || 'Tag',
        color: color || '#6366f1',
        isDefault: false
      }
    });

    res.status(201).json({ category });
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ error: 'Failed to create category.' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category || category.userId !== userId) {
      return res.status(404).json({ error: 'Category not found or unauthorized.' });
    }

    if (category.isDefault) {
      return res.status(400).json({ error: 'Default categories cannot be deleted.' });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Failed to delete category.' });
  }
};

module.exports = { getCategories, createCategory, deleteCategory };
