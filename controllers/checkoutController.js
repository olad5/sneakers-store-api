import UserSettings from '../models/UserSettings.js';

const getUserSettings = async (req, res) => {
  const userSettings = await UserSettings.find({status: true, user: req.user.userId})
  res.status(200).json({status: true, message: "Settings Retrieved", userSettings: userSettings});
}


const updateUserSettings = async (req, res) => {
  let userSettings = await UserSettings.find({user: req.user.userId})
  const {firstName, lastName, email, phone, address, city, state, zipCode} = req.body

  // creates initial settings for the user
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
    return res.status(201).json({status: true, message: 'Settings created', userSettings: data});
  }


  // updates the user settings with updated data
  userSettings = await UserSettings.findOneAndUpdate({user: req.user.userId}, req.body, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({status: true, message: 'Settings updated', data: userSettings});

}


export {getUserSettings, updateUserSettings};
