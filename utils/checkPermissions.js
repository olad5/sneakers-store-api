import * as CustomError from '../errors/index.js';

export const checkPermissions = (requestUser, resourceUserId) => {
  if (requestUser.role === 'admin') return;
  if (requestUser.userId === resourceUserId.toString()) return;
  throw new CustomError.UnauthorizedError(
    'Not authorized to access this route'
  );
};


