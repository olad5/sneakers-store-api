import {StatusCodes} from 'http-status-codes'
import User from '../models/User.js'
import {attachCookiesToResponse} from '../utils/jwt.js';
import createTokenUser from '../utils/createTokenUser.js';

export const register = async (req, res) => {
  const {email, name, password} = req.body;

  try {
    const emailAlreadyExists = await User.findOne({email});
    if (emailAlreadyExists) {
      return res.status(StatusCodes.BAD_REQUEST).json({status: false, message: 'Email already exists'});
    }

    // first registered user is automatically an admin
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? 'admin' : 'user';

    const user = await User.create({name, email, password, role});
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({res, user: tokenUser});

    res.status(StatusCodes.CREATED).json({status: true, message: 'Account created', user: tokenUser});

  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({message: error.message});
  }
};

export const login = async (req, res) => {
  const {email, password} = req.body;
  try {

    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({status: false, message: 'Please provide email and password'});
    }
    const user = await User.findOne({email});

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({status: false, message: 'Invalid Credentials'});
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(StatusCodes.UNAUTHORIZED).json({status: false, message: 'Invalid Credentials'});
    }

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({res, user: tokenUser});

    res.status(StatusCodes.OK).json({status: true, message: 'User Logged In', user: tokenUser});
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({status: false, message: error.message});
  }
};

export const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });
  res.status(StatusCodes.OK).json({status: true, message: 'User Logged Out!'});
};

