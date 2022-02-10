import mongoose from 'mongoose'
import validator from 'validator'

const UserSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A User must have settings']
  },
  firstName: {
    type: String,
    required: [true, 'Please provide a first name'],
    minlength: 3,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide valid email',
    },
  },
  address: {
    type: String,
    required: [true, 'Please provide an address'],
    minlength: 6,
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    minlength: 6,
  },
  city: {
    type: String,
    required: [true, 'Please provide city'],
  },
  state: {
    type: String,
    required: [true, 'Please provide state'],
  },
  zipCode: {
    type: String,
    required: [true, 'Please provide zip code'],
  },

})

const UserSettings = mongoose.model('UserSettings', UserSettingsSchema);
export default UserSettings;
