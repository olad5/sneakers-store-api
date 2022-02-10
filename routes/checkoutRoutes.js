
import express from 'express'
import {getUserSettings, updateUserSettings} from '../controllers/checkoutController.js';
import {authenticateUser, authorizePermissions, } from '../middleware/authentication.js';
const router = express.Router()



router.route('/').get(authenticateUser, getUserSettings);
router.route('/').patch(authenticateUser, updateUserSettings);

export default router;
