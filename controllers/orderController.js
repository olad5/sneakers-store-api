import Order from '../models/Order.js';
import Item from '../models/Item.js';
import {checkPermissions} from '../utils/checkPermissions.js';
import {emptyCartUtil, cartUtil} from '../utils/index.js';
import {CustomAPIError} from '../errors/custom-api.js';
import {initializePayment, verifyPayment} from '../utils/paystackOps.js';


const createOrder = async (req, res) => {
    const {tax, shippingFee} = req.body;


    let cart = await cartUtil(req.user.userId)
    let cartItems = cart.items
    let subtotal = cart.subTotal

    if (!cartItems || cartItems.length < 1) {
        throw new CustomAPIError("No cart items provided", 400);
    }

    if (!tax || !shippingFee) {
        throw new CustomAPIError("Please provide tax and shipping fee", 400);
    }

    let orderItems = [...cartItems];

    // calculate total
    const total = tax + shippingFee + subtotal;

    let body = {// pass this to paystack call
        "email": req.user.email,
        "amount": total,
        "currency": "NGN",
    }

    let paystackRes = await initializePayment(body)// use paystack payment system

    const order = await Order.create({
        orderItems,
        total,
        subtotal,
        tax,
        shippingFee,
        paystackRef: paystackRes.data.reference,
        paystackAccesCode: paystackRes.data.access_code,
        user: req.user.userId,
    });

    let data = await order.save();
    await emptyCartUtil(req.user.userId)// emptys the cart once the order has been made

    return res.status(201).json({status: true, message: "Order Initiated", data: order})



};

const getAllOrders = async (req, res) => {
    const orders = await Order.find({}).sort({createdAt: 'desc'});
    res.status(200).json({status: true, message: "Orders Retrieved", orders, count: orders.length});
};

const getSingleOrder = async (req, res) => {
    const {id: orderId} = req.params;
    const order = await Order.findOne({_id: orderId}).select('-paystackRef -paystackAccesCode');;
    if (!order) {
        throw new CustomAPIError(`No order with id : ${orderId}`, 404);
    }
    checkPermissions(req.user, order.user);
    res.status(200).json({status: true, message: "Order Retrieved", order});

};

const getCurrentUserOrders = async (req, res) => {
    const orders = await Order.find({user: req.user.userId}).select('-paystackRef -paystackAccesCode');
    res.status(200).json({status: true, message: "Current User Orders Retrieved", orders, count: orders.length});
};


const updateOrder = async (req, res) => {// this is for updating the order after the user has paid
    const {id: orderId} = req.params;
    const {paystackRef} = req.body;// gets paystack's reference code 

    let paystackRes = await verifyPayment(paystackRef)

    const order = await Order.findOne({_id: orderId});

    if (!paystackRef) {
        throw new CustomAPIError("No paystackRef", 400);
    }

    if (!order) {
        throw new CustomAPIError(`No order with id : ${orderId}`, 404);
    }


    // removes the quantity purchased from the inventory, after the order has been paid for 
    if (order.status != 'paid' && paystackRes.data.status == 'success') {
        for (let n in order.orderItems) {
            let quantityPurchased = order.orderItems[n].quantity
            let item = await Item.findById(order.orderItems[n].itemId)
            item.inventory -= quantityPurchased;// changes the amount in the inventory
            await item.save();
        }

        order.status = 'paid';
        await order.save();
    }

    res.status(200).json({status: true, message: "Order Updated", order});

};

export {getAllOrders, getSingleOrder, getCurrentUserOrders, createOrder, updateOrder};
