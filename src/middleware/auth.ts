import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../services/authService';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await verifyToken(token);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await verifyToken(token);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name
    };
  } catch (error) {
    // Ignore invalid token for optional authentication
  }

  next();
};
