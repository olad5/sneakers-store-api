import {StatusCodes} from 'http-status-codes'
import UserSettings from '../models/UserSettings.js';

const getUserSettings = async (req, res) => {
  try {
    const userSettings = await UserSettings.find({user: req.user.userId})
    res.status(StatusCodes.OK).json({userSettings: userSettings});
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({message: error.message});
  }

}


const updateUserSettings = async (req, res) => {
  try {
    let userSettings = await UserSettings.find({user: req.user.userId})
    const {firstName, lastName, email, phone, address, city, state, zipCode} = req.body

    // creates initial settings for the user
    // if (Array.isArray(userSettings) && userSettings.length === 0) {
    if (userSettings.length === 0) {
      const initialSettings = await UserSettings.create({
        user: req.user.userId,
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        zipCode
      });

      let data = await initialSettings.save();
      return res.status(StatusCodes.CREATED).json({status: true, message: 'Settings created', userSettings: data});
    }


    // updates the user settings with updated data
    userSettings = await UserSettings.findOneAndUpdate({user: req.user.userId}, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(StatusCodes.OK).json({status: true, message: 'Settings updated', data: userSettings});
  } catch (error) {
    return res.status(StatusCodes.NOT_FOUND).json({message: error.message});
  }

}


export {getUserSettings, updateUserSettings};
