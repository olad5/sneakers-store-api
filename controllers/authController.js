import User from '../models/User.js'
import {attachCookiesToResponse} from '../utils/jwt.js';
import createTokenUser from '../utils/createTokenUser.js';
import {CustomAPIError} from '../errors/custom-api.js';

export const register = async (req, res) => {
  const {email, name, password} = req.body;

  const emailAlreadyExists = await User.findOne({email});
  if (emailAlreadyExists) {
    throw new CustomAPIError('Email already exists', 400);
  }

  // first registered user is automatically an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  const user = await User.create({name, email, password, role});
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({res, user: tokenUser});

  res.status(201).json({status: true, message: 'Account created', user: tokenUser});

};

export const login = async (req, res) => {
  const {email, password} = req.body;

  if (!email || !password) {
    throw new CustomAPIError('Please provide email and password', 400);
  }
  const user = await User.findOne({email});

  if (!user) {
    throw new CustomAPIError('Invalid Credentials', 401);
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomAPIError('Invalid Credentials', 401);
  }

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({res, user: tokenUser});

  res.status(200).json({status: true, message: 'User Logged In', user: tokenUser});
};

export const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });
  res.status(200).json({status: true, message: 'User Logged Out!'});
};

