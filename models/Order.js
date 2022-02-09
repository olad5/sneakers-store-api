import mongoose from 'mongoose'
import {CartItemSchema} from './Cart.js';

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
    total: {// this is subtotal + shippingFee
      type: Number,
      required: true,
    },
    orderItems: [CartItemSchema],

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
    paystackRef: {
      type: String,
      required: true,
    },
    paystackAccesCode: {
      type: String,
      required: true,
    },
  },
  {timestamps: true}
);

const Order = mongoose.model('Order', OrderSchema);

export default Order;
