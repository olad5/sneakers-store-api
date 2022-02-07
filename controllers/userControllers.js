import User from '../models/User.js';
import {StatusCodes} from 'http-status-codes';
import {attachCookiesToResponse, createTokenUser, checkPermissions} from '../utils/index.js';

const getAllUsers = async (req, res) => {
  const users = await User.find({role: 'user'}).select('-password');
  res.status(StatusCodes.OK).json({users, count: users.length});
};

const getSingleUser = async (req, res) => {
  try {
    const user = await User.findOne({_id: req.params.id}).select('-password');
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({message: `No user with id : ${req.params.id}`})
    }
    checkPermissions(req.user, user._id);
    res.status(StatusCodes.OK).json({user});

  } catch (error) {

    res.status(StatusCodes.BAD_REQUEST).json({message: error.message});
  }
};

const showCurrentUser = async (req, res) => {
  const user = await User.findOne({_id: req.user.userId});
  const tokenUser = createTokenUser(user)
  res.status(StatusCodes.OK).json({user: tokenUser});
};

const updateUser = async (req, res) => {
  const {email, name} = req.body;
  try {
    if (!email || !name) {
      return res.status(StatusCodes.BAD_REQUEST).json({message: 'Please provide all values'})
    }
    const user = await User.findOne({_id: req.user.userId});

    user.email = email;
    user.name = name;

    await user.save();
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({res, user: tokenUser});
    res.status(StatusCodes.OK).json({user: tokenUser});

  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({message: error.message});

  }
};

const updateUserPassword = async (req, res) => {
  const {oldPassword, newPassword} = req.body;
  try {
    if (!oldPassword || !newPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({message: 'Please provide both values'})
    }
    const user = await User.findOne({_id: req.user.userId});

    const isPasswordCorrect = await user.comparePassword(oldPassword);

    if (!isPasswordCorrect) {
      return res.status(StatusCodes.BAD_REQUEST).json({message: 'Invalid Credentials'})
    }

    user.password = newPassword;

    await user.save();
    res.status(StatusCodes.OK).json({message: 'Success! Password Updated.'});

  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({message: error.message});

  };
};

export {getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword};

