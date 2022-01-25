import express from 'express'
import {authenticateUser, authorizePermissions, } from '../middleware/authentication.js';
import {createItem, getAllItems, getSingleItem, updateItem, deleteItem, uploadImages} from '../controllers/itemController.js';

const router = express.Router()


router
  .route('/')
  .post([authenticateUser, authorizePermissions('admin')], createItem)
  .get(getAllItems);


router
  .route('/:id')
  .get(getSingleItem)
  .patch([authenticateUser, authorizePermissions('admin')], uploadImages, updateItem)
  .delete([authenticateUser, authorizePermissions('admin')], deleteItem);

export default router
