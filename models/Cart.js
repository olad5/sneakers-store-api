import mongoose from 'mongoose'

const CartItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity can not be less then 1.']
  },
  price: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true,
  }
}, {
  timestamps: true
})

const CartSchema = new mongoose.Schema({

  items: [CartItemSchema],

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Cart must belong to a User!']
  },

  subTotal: {
    default: 0,
    type: Number
  }
}, {
  timestamps: true
})



const Cart = mongoose.model('Cart', CartSchema);
export {Cart, CartItemSchema}
