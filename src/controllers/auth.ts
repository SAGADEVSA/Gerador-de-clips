import express, { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../server';
import { hashPassword, verifyPassword, generateToken } from '../services/authService';
import { authenticate } from '../middleware/auth';

const router = express.Router();

const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword
      } as Prisma.UserCreateInput
    });

    const token = generateToken({ userId: user.id, email: user.email, name: user.name });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        hashedPassword: true
      }
    });
    if (!user || !user.hashedPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordValid = await verifyPassword(password, user.hashedPassword);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ userId: user.id, email: user.email, name: user.name });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

const me = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({ user: req.user });
};

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);

export default router;
