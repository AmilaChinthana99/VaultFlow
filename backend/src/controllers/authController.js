const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const defaultCategories = [
  { name: 'Salary', icon: 'Briefcase', color: '#10b981', isDefault: true },
  { name: 'Investments', icon: 'TrendingUp', color: '#06b6d4', isDefault: true },
  { name: 'Freelance', icon: 'Laptop', color: '#8b5cf6', isDefault: true },
  { name: 'Food & Dining', icon: 'Utensils', color: '#f59e0b', isDefault: true },
  { name: 'Transport', icon: 'Car', color: '#3b82f6', isDefault: true },
  { name: 'Utilities & Bills', icon: 'Zap', color: '#ef4444', isDefault: true },
  { name: 'Entertainment', icon: 'Film', color: '#ec4899', isDefault: true },
  { name: 'Shopping', icon: 'ShoppingBag', color: '#a855f7', isDefault: true },
  { name: 'Health & Fitness', icon: 'Heart', color: '#14b8a6', isDefault: true },
  { name: 'Education', icon: 'BookOpen', color: '#6366f1', isDefault: true }
];

const seedDefaultCategoriesForUser = async (userId) => {
  const existing = await prisma.category.findMany({ where: { userId } });
  if (existing.length === 0) {
    await prisma.category.createMany({
      data: defaultCategories.map(cat => ({
        ...cat,
        userId
      }))
    });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword
      }
    });

    // Seed standard categories for new user
    await seedDefaultCategoriesForUser(user.id);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'super-secret-jwt-key-finance-tracker-2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Ensure default categories exist
    await seedDefaultCategoriesForUser(user.id);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'super-secret-jwt-key-finance-tracker-2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
};

module.exports = { register, login, getMe, seedDefaultCategoriesForUser };
