import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { UserRole } from '../models/User';

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden, insufficient permissions' });
    }
    
    next();
  };
};

export const isSuperadmin = requireRole([UserRole.SUPERADMIN]);
export const isBusinessAdmin = requireRole([UserRole.BUSINESS_ADMIN]);
export const isCustomer = requireRole([UserRole.CUSTOMER]);
