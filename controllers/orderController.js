import Order from '../models/Order.js';
import Item from '../models/Item.js';
import {StatusCodes} from 'http-status-codes';
import {checkPermissions} from '../utils/checkPermissions.js';
import {emptyCartUtil, cartUtil} from '../utils/index.js';
import {initializePayment, verifyPayment} from '../utils/paystackOps.js';


const createOrder = async (req, res) => {
    const {tax, shippingFee} = req.body;

    try {

        let cart = await cartUtil(req.user.userId)
        let cartItems = cart.items
        let subtotal = cart.subTotal

        if (!cartItems || cartItems.length < 1) {
            return res.status(StatusCodes.BAD_REQUEST).json({message: "No cart items provided"})
        }

        if (!tax || !shippingFee) {
            return res.status(StatusCodes.BAD_REQUEST).json({message: "Please provide tax and shipping fee"})
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

        return res.status(StatusCodes.CREATED).json({status: true, message: "Order Initiated", data: order})

    } catch (err) {
        console.log(err)
        res.status(StatusCodes.BAD_REQUEST).json({status: false, message: "Something Went Wrong", err: err})
    }


};

const getAllOrders = async (req, res) => {
    const orders = await Order.find({}).sort({createdAt: 'desc'});
    res.status(StatusCodes.OK).json({orders, count: orders.length});
};

const getSingleOrder = async (req, res) => {
    const {id: orderId} = req.params;
    try {
        const order = await Order.findOne({_id: orderId}).select('-paystackRef -paystackAccesCode');;
        if (!order) {
            return res.status(StatusCodes.NOT_FOUND).json({message: `No order with id : ${orderId}`})
        }
        checkPermissions(req.user, order.user);
        res.status(StatusCodes.OK).json({order});

    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({message: error.message});

    }
};

const getCurrentUserOrders = async (req, res) => {
    const orders = await Order.find({user: req.user.userId}).select('-paystackRef -paystackAccesCode');
    res.status(StatusCodes.OK).json({orders, count: orders.length});
};


const updateOrder = async (req, res) => {// this is for updating the order after the user has paid
    const {id: orderId} = req.params;
    const {paystackRef} = req.body;// gets paystack's reference code 

    try {
        let paystackRes = await verifyPayment(paystackRef)

        const order = await Order.findOne({_id: orderId});

        if (!paystackRef) {
            return res.status(StatusCodes.BAD_REQUEST).json({message: "No payment Id"})
        }

        if (!order) {
            return res.status(StatusCodes.NOT_FOUND).json({message: `No order with id : ${orderId}`})
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

        res.status(StatusCodes.OK).json({order});
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).json({message: error.message});
    }

};

export {getAllOrders, getSingleOrder, getCurrentUserOrders, createOrder, updateOrder};
