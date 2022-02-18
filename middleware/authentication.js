import {isTokenValid} from '../utils/jwt.js';

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new CustomAPIError('Authentication Invalid', 401);
  }

  try {
    const {name, userId, email, role} = isTokenValid({token});
    req.user = {name, userId, email, role, };
    next();
  } catch (error) {
    throw new CustomAPIError('Authentication Invalid', 401);

  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomAPIError('Unauthorized to access this route', 403);
    }
    next();
  };
};

export {authenticateUser, authorizePermissions};

