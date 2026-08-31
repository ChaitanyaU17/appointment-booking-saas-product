import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const generateToken = (res: Response, userId: string) => {
  const secret = process.env.JWT_SECRET as string;
  const token = jwt.sign({ userId }, secret, {
    expiresIn: '30d',
  });

  res.cookie('sid', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export const clearToken = (res: Response) => {
  res.cookie('sid', '', {
    httpOnly: true,
    expires: new Date(0),
  });
};
