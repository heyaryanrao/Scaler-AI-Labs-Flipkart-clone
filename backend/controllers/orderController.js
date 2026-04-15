const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const {
    createOrder, findOrderById, findOrderByPaymentId,
    findOrdersByUser, findAllOrders, updateOrderStatus, deleteOrder: deleteOrderById,
} = require('../models/orderModel');
const { updateStock } = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');

// Create New Order
exports.newOrder = asyncErrorHandler(async (req, res, next) => {

    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        totalPrice,
    } = req.body;

    // Check for duplicate order by payment ID
    const orderExist = await findOrderByPaymentId(paymentInfo.id);

    if (orderExist) {
        return next(new ErrorHandler("Order Already Placed", 400));
    }

    const order = await createOrder({
        shippingInfo,
        orderItems,
        paymentInfo,
        totalPrice,
        userId: req.user._id,
    });

    await sendEmail({
        email: req.user.email,
        templateId: process.env.SENDGRID_ORDER_TEMPLATEID,
        data: {
            name: req.user.name,
            shippingInfo,
            orderItems,
            totalPrice,
            oid: order._id,
        }
    });

    res.status(201).json({
        success: true,
        order,
    });
});

// Get Single Order Details
exports.getSingleOrderDetails = asyncErrorHandler(async (req, res, next) => {

    const order = await findOrderById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    res.status(200).json({
        success: true,
        order,
    });
});

// Get Logged In User Orders
exports.myOrders = asyncErrorHandler(async (req, res, next) => {

    const orders = await findOrdersByUser(req.user._id);

    if (!orders || orders.length === 0) {
        return res.status(200).json({
            success: true,
            orders: [],
        });
    }

    res.status(200).json({
        success: true,
        orders,
    });
});

// Get All Orders ---ADMIN
exports.getAllOrders = asyncErrorHandler(async (req, res, next) => {

    const orders = await findAllOrders();

    let totalAmount = 0;
    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        orders,
        totalAmount,
    });
});

// Update Order Status ---ADMIN
exports.updateOrder = asyncErrorHandler(async (req, res, next) => {

    const order = await findOrderById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("Already Delivered", 400));
    }

    if (req.body.status === "Shipped") {
        for (const item of order.orderItems) {
            await updateStock(item.product, item.quantity);
        }
    }

    await updateOrderStatus(req.params.id, req.body.status);

    res.status(200).json({
        success: true
    });
});

// Delete Order ---ADMIN
exports.deleteOrder = asyncErrorHandler(async (req, res, next) => {

    const order = await findOrderById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order Not Found", 404));
    }

    await deleteOrderById(req.params.id);

    res.status(200).json({
        success: true,
    });
});