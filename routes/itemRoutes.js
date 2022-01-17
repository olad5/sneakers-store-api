import express from 'express'
import {getAllItems, createItem} from '../controllers/itemController.js'
const router = express.Router()


router.route('/').get(getAllItems).post(createItem)
export default router
