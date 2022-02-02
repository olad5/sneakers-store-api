import express from 'express'
import {authenticateUser} from '../middleware/authentication.js';
import {addItemToCart, getCart, emptyCart, deleteItemFromCart, updateCart} from '../controllers/cartControllers.js';

const router = express.Router()


router
  .route('/')
  .get(authenticateUser, getCart)
  .post(authenticateUser, addItemToCart)
  .patch(authenticateUser, updateCart)
  .delete(authenticateUser, deleteItemFromCart);


router
  .route('/empty-cart')
  .delete(authenticateUser, emptyCart);

export default router
