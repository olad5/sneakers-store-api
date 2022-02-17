import {Cart} from '../models/Cart.js'
import Item from '../models/Item.js';
import {cartUtil, emptyCartUtil} from '../utils/index.js';
import *  as CustomError from '../errors/index.js'


const outOfStockUtil = async (quantInStock, quantInCart, quantity) => {
  //checks if the product is out of stock 
  if ((quantInStock - (quantInCart + quantity)) < 0) {
    return true
  } else {
    return false
  }
}

const addItemToCart = async (req, res) => {
  const itemId = req.body.itemId;
  const quantity = Number.parseInt(req.body.quantity);
  let cart = await cartUtil(req.user.userId)
  const productDetails = await Item.findOne({_id: itemId});// find the specific item

  if (!productDetails) {
    throw new CustomError.NotFoundError('Item not found');
  }
  //--If Cart Exists ----
  if (cart) {
    if (cart.items.length === 0) {
      cart.subTotal = 0; // if there are no items in the cart, the subtotal should be equal to zero
    }
    //---- check if index exists ----
    const indexFound = cart.items.findIndex(item => item.itemId.id == itemId);

    if (indexFound !== -1) {
      //----------checks if the product is out of stock -------
      const isInStock = await outOfStockUtil(productDetails.inventory, cart.items[indexFound].quantity, quantity);
      if (isInStock) {
        throw new CustomError.BadRequestError("Item out of Stock");

      }
      //----------check if product exist,just add the previous quantity with the new quantity and update the total price-------
      cart.items[indexFound].quantity = cart.items[indexFound].quantity + quantity;
      cart.items[indexFound].total = cart.items[indexFound].quantity * productDetails.price;
      cart.items[indexFound].price = productDetails.price
      cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
    }
    //----Check if Quantity is Greater than 0 then add item to items Array ----
    else if (quantity > 0 && quantity <= productDetails.inventory) {// here the item is not in the cart
      cart.items.push({
        itemId: itemId,
        quantity: quantity,
        price: productDetails.price,
        total: parseInt(productDetails.price * quantity)
      })
      cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
    }

    else {// user gives invalid request
      throw new CustomError.BadRequestError("Invalid request");
    }
    let data = await cart.save();
    res.status(200).json({status: true, message: "Item added to cart", data: data})
  }
  //------------ if there is no user with a cart...it creates a new cart and then adds the item to the cart that has been created------------
  else {
    const cartData = {
      items: [{
        itemId: itemId,
        quantity: quantity,
        total: parseInt(productDetails.price * quantity),
        price: productDetails.price
      }],
      user: req.user.userId,
      subTotal: parseInt(productDetails.price * quantity)
    }
    cart = await Cart.create(cartData)
    res.status(201).json({status: true, message: "Cart created", data: cart})
  }
}

const getCart = async (req, res) => {

  const cart = await cartUtil(req.user.userId)
  if (!cart) {
    throw new CustomError.NotFoundError("Cart Not Found");
  }
  res.status(200).json({status: true, message: "Cart retrieved", data: cart})
}

const updateCart = async (req, res) => {
  const itemId = req.body.itemId;
  const quantity = Number.parseInt(req.body.quantity);
  const cart = await cartUtil(req.user.userId)
  if (!cart) {
    throw new CustomError.NotFoundError("Cart Not Found");
  }
  const productDetails = await Item.findOne({_id: itemId});
  const indexFound = cart.items.findIndex(item => item.itemId.id == itemId);

  // if the item doesnt exist or it is not in the cart 
  if (!productDetails || indexFound === -1) {
    throw new CustomError.NotFoundError("Item Not Found");
  }

  // checks if the new quantity value is greater than the inventory
  const isInStock = await outOfStockUtil(productDetails.inventory, 0, quantity);
  if (isInStock) {
    throw new CustomError.BadRequestError("Item out of Stock");
  }

  // Make the changes if the quantity is less or equal to the inventory
  cart.items[indexFound].quantity = quantity;
  cart.items[indexFound].total = cart.items[indexFound].quantity * productDetails.price;
  cart.items[indexFound].price = productDetails.price
  cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
  let data = await cart.save();
  res.status(200).json({status: true, message: "Cart updated", data: data})

}

const deleteItemFromCart = async (req, res) => {
  const itemId = req.body.itemId;
  let cart = await cartUtil(req.user.userId)
  if (!cart) {
    throw new CustomError.NotFoundError("Cart Not Found");
  }
  const productDetails = await Item.findOne({_id: itemId});
  const indexFound = cart.items.findIndex(item => item.itemId.id == itemId);

  // if the item doesnt exist or it is not in the cart return not found
  if (!productDetails || indexFound === -1) {
    throw new CustomError.NotFoundError('Item not found');
  }
  cart.items.splice(indexFound, 1);// Deletes the item from the cart
  if (cart.items.length !== 0) {
    cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
  } else {
    cart.subTotal = 0
  }
  let data = await cart.save();
  res.status(200).json({status: true, message: "Item removed from cart", data: data})

}
const emptyUserCart = async (req, res) => {
  let data = await emptyCartUtil(req.user.userId)
  if (data === 404) {
    throw new CustomError.NotFoundError("Cart Not Found");
  }

  res.status(200).json({status: true, message: "Cart Has been emptied", data: data})
}

export {emptyUserCart, getCart, addItemToCart, deleteItemFromCart, updateCart};
