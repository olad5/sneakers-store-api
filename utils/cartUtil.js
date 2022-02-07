
import {Cart} from '../models/Cart.js'
const cartUtil = async (userId) => {
  // gets the cart associated with the user
  let cart = await Cart.find({user: userId}).populate({path: "items.itemId", select: "name price total"})
  cart = cart[0]
  return cart;
}

export default cartUtil
