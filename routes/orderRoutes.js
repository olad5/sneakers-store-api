import express from 'express'
import {authenticateUser, authorizePermissions, } from '../middleware/authentication.js';
import {getAllOrders, getSingleOrder, getCurrentUserOrders, createOrder, updateOrder} from '../controllers/orderController.js';

const router = express.Router();

router
  .route('/')
  .post(authenticateUser, createOrder)
  .get(authenticateUser, authorizePermissions('admin'), getAllOrders);

router.route('/showAllMyOrders').get(authenticateUser, getCurrentUserOrders);

router
  .route('/:id')
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);

export default router;

