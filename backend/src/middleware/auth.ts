import { NextFunction, Request, Response } from 'express';
import { Role } from '../constants/enums';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

// Augment Express's Request type so req.user is available & typed everywhere.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Reads the Bearer token, verifies it, and attaches req.user.
// Use on any route that needs a logged-in user.
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }
  const token = header.slice('Bearer '.length);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }
}

// Role-based access control. Pass the roles allowed to hit this route.
// e.g. requireRole('ADMIN') or requireRole('ADMIN', 'STAFF')
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized();
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }
    next();
  };
}

// Optional auth: attaches req.user if a valid token is present, but does not
// fail if absent. Useful for booking endpoints that work for guests too.
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = verifyToken(header.slice('Bearer '.length));
    } catch {
      /* ignore invalid token for optional auth */
    }
  }
  next();
}
