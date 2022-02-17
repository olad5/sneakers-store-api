import cartUtil from "./cartUtil.js";

const emptyCartUtil = async (userId) => {
  try {
    let cart = await cartUtil(userId)

    if (!cart) {
      return 404
    }
    cart.items = [];// remove all the items from the cart
    cart.subTotal = 0// resets the subtotal value of the cart 
    let data = await cart.save(); // returns the empty cart

    return data

  } catch (err) {
    res.status(400).json({message: "Something Went Wrong", err: err})
  }
}

export default emptyCartUtil
