/**
 * Authentication and Authorization Middleware for MAZAQ
 */

import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { AdminUser, Role } from '../src/types';

export interface AuthenticatedRequest extends Request {
  user?: AdminUser;
}

export function authenticateAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'غير مصرح: يرجى تسجيل الدخول كمسؤول للمتابعة',
    });
  }

  const token = authHeader.split(' ')[1];
  const user = db.validateSession(token);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'انتهت صلاحية الجلسة أو الرمز غير صالح',
    });
  }

  req.user = user;
  next();
}

export function requireRoles(allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'غير مصرح' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'صلاحيات غير كافية لإجراء هذه العملية',
      });
    }

    next();
  };
}
