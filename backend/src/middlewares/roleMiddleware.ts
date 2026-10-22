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
export const isAgent = requireRole([UserRole.AGENT]);
export const isSuperadminOrAgent = requireRole([UserRole.SUPERADMIN, UserRole.AGENT]);

export const verifyAgentShopAccess = (req: AuthRequest, res: Response, next: NextFunction): any => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  // Superadmins have access to all shops
  if (req.user.role === UserRole.SUPERADMIN) {
    return next();
  }

  if (req.user.role === UserRole.AGENT) {
    const shopId = req.params.shopId || req.params.id || req.body.businessId || req.query.businessId;
    if (!shopId) {
      return next();
    }

    const assignedIds = (req.user.assignedBusinessIds || []).map((id: any) => id.toString());
    if (!assignedIds.includes(shopId.toString())) {
      return res.status(403).json({ message: 'Forbidden: You are not assigned to this shop' });
    }

    return next();
  }

  return res.status(403).json({ message: 'Forbidden, insufficient permissions' });
};

