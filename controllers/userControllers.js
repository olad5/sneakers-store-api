import User from '../models/User.js';
import {StatusCodes} from 'http-status-codes';
import {attachCookiesToResponse, createTokenUser, checkPermissions} from '../utils/index.js';
import *  as CustomError from '../errors/index.js'

const getAllUsers = async (req, res) => {
  const users = await User.find({role: 'user'}).select('-password');
  res.status(StatusCodes.OK).json({status: true, message: 'Users Retrieved', users, count: users.length});
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({_id: req.params.id}).select('-password');
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({status: true, message: 'User Retrieved', user});

};

const showCurrentUser = async (req, res) => {
  const user = await User.findOne({_id: req.user.userId});
  const tokenUser = createTokenUser(user)
  res.status(StatusCodes.OK).json({status: true, message: 'Current User Retrieved', user: tokenUser});
};

const updateUser = async (req, res) => {
  const {email, name} = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError('Please provide all values');
  }
  const user = await User.findOne({_id: req.user.userId});

  user.email = email;
  user.name = name;

  await user.save();
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({res, user: tokenUser});
  res.status(StatusCodes.OK).json({status: true, message: 'User Updated', user: tokenUser});

};

const updateUserPassword = async (req, res) => {
  const {oldPassword, newPassword} = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Please provide both values');
  }
  const user = await User.findOne({_id: req.user.userId});

  // comparePassword is coming from the User schema
  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new CustomError.BadRequestError('Invalid Credentials');
  }

  user.password = newPassword;

  await user.save();
  res.status(StatusCodes.OK).json({status: true, message: 'Success! Password Updated.'});

};

export {getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword};

