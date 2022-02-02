import mongoose from 'mongoose'

const SingleOrderItemSchema = mongoose.Schema({
  name: {type: String, required: true},
  image: {type: String, required: true},
  price: {type: Number, required: true},// shows the price of an item
  amount: {type: Number, required: true},// this shows the number of quantities of each item 
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
  },
});

const OrderSchema = mongoose.Schema(
  {
    tax: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    orderItems: [SingleOrderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'failed', 'paid', 'delivered', 'canceled'],
      default: 'pending',
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    clientSecret: {
      type: String,
      required: true,
    },
    paymentIntentId: {
      type: String,
    },
  },
  {timestamps: true}
);

const Order = mongoose.model('Order', CartSchema);

export default Order;
