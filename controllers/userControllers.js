import User from '../models/User.js';
import {attachCookiesToResponse, createTokenUser, checkPermissions} from '../utils/index.js';
import {CustomAPIError} from '../errors/custom-api.js';

const getAllUsers = async (req, res) => {
  const users = await User.find({role: 'user'}).select('-password');
  res.status(200).json({status: true, message: 'Users Retrieved', users, count: users.length});
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({_id: req.params.id}).select('-password');
  if (!user) {
    throw new CustomAPIError(`No user with id : ${req.params.id}`, 404);
  }
  checkPermissions(req.user, user._id);
  res.status(200).json({status: true, message: 'User Retrieved', user});

};

const showCurrentUser = async (req, res) => {
  const user = await User.findOne({_id: req.user.userId});
  const tokenUser = createTokenUser(user)
  res.status(200).json({status: true, message: 'Current User Retrieved', user: tokenUser});
};

const updateUser = async (req, res) => {
  const {email, name} = req.body;
  if (!email || !name) {
    throw new CustomAPIError('Please provide all values', 400);
  }
  const user = await User.findOne({_id: req.user.userId});

  user.email = email;
  user.name = name;

  await user.save();
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({res, user: tokenUser});
  res.status(200).json({status: true, message: 'User Updated', user: tokenUser});

};

const updateUserPassword = async (req, res) => {
  const {oldPassword, newPassword} = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomAPIError('Please provide both values', 400);
  }
  const user = await User.findOne({_id: req.user.userId});

  // comparePassword is coming from the User schema
  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new CustomAPIError('Invalid Credentials', 400);
  }

  user.password = newPassword;

  await user.save();
  res.status(200).json({status: true, message: 'Success! Password Updated.'});

};

export {getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword};

