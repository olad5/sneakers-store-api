import * as CustomError from '../errors/index.js';
import {StatusCodes} from 'http-status-codes'
import {isTokenValid} from '../utils/jwt.js';

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;


  try {
    if (!token) {
      throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }

    const {name, userId, email, role} = isTokenValid({token});
    req.user = {name, userId, email, role, };
    next();
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({message: error.message});
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        throw new CustomError.UnauthorizedError(
          'Unauthorized to access this route'
        );
      }

      next();
    } catch (error) {
      res.status(StatusCodes.FORBIDDEN).json({message: error.message});

    }
  };
};

export {authenticateUser, authorizePermissions};

