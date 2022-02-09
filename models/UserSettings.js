import mongoose from 'mongoose'
import validator from 'validator'

const UserSettingsSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide name'],
    minlength: 3,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: [true, 'Please provide name'],
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
    required: [true, 'Please provide a address'],
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
    minlength: 6,
  },
  state: {
    type: String,
    required: [true, 'Please provide state'],
  },
  zipCode: {
    type: String,
    required: [true, 'Please provide zip codde'],
  },

})

export default UserSettingsSchema;
