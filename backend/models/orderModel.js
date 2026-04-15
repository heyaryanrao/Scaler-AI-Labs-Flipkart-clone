const { query } = require('../config/database');

// Format order row to match Mongoose output shape
const formatOrder = (row, orderItems = []) => {
    if (!row) return null;
    return {
        _id: row.id,
        shippingInfo: {
            address: row.shipping_address,
            city: row.shipping_city,
            state: row.shipping_state,
            country: row.shipping_country,
            pincode: row.shipping_pincode,
            phoneNo: row.shipping_phone,
        },
        orderItems: orderItems.map(item => ({
            _id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            quantity: item.quantity,
            image: item.image,
            product: item.product_id,
        })),
        user: row.user_id,
        paymentInfo: {
            id: row.payment_id,
            status: row.payment_status,
        },
        paidAt: row.paid_at,
        totalPrice: parseFloat(row.total_price),
        orderStatus: row.order_status,
        deliveredAt: row.delivered_at,
        shippedAt: row.shipped_at,
        createdAt: row.created_at,
    };
};

// Format order with populated user info
const formatOrderWithUser = (row, orderItems = []) => {
    const order = formatOrder(row, orderItems);
    if (!order) return null;
    if (row.user_name || row.user_email) {
        order.user = {
            _id: row.user_id,
            name: row.user_name,
            email: row.user_email,
        };
    }
    return order;
};

// Create order + order items in a transaction
const createOrder = async ({ shippingInfo, orderItems, paymentInfo, totalPrice, userId }) => {
    const client = (await require('../config/database').pool.connect());
    try {
        await client.query('BEGIN');

        const orderResult = await client.query(
            `INSERT INTO orders (user_id, shipping_address, shipping_city, shipping_state, shipping_country, shipping_pincode, shipping_phone, payment_id, payment_status, paid_at, total_price)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)
             RETURNING *`,
            [
                userId,
                shippingInfo.address, shippingInfo.city, shippingInfo.state,
                shippingInfo.country, shippingInfo.pincode, shippingInfo.phoneNo,
                paymentInfo.id, paymentInfo.status,
                totalPrice,
            ]
        );
        const order = orderResult.rows[0];

        const items = [];
        for (const item of orderItems) {
            const itemResult = await client.query(
                `INSERT INTO order_items (order_id, product_id, name, price, quantity, image)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [order.id, item.product, item.name, item.price, item.quantity, item.image]
            );
            items.push(itemResult.rows[0]);
        }

        await client.query('COMMIT');
        return formatOrder(order, items);
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// Find order by ID (with user info populated)
const findOrderById = async (id) => {
    const result = await query(
        `SELECT o.*, u.name as user_name, u.email as user_email
         FROM orders o LEFT JOIN users u ON o.user_id = u.id
         WHERE o.id = $1`,
        [id]
    );
    if (result.rows.length === 0) return null;

    const items = (await query(`SELECT * FROM order_items WHERE order_id = $1`, [id])).rows;
    return formatOrderWithUser(result.rows[0], items);
};

// Find order by payment ID
const findOrderByPaymentId = async (paymentId) => {
    const result = await query(
        `SELECT * FROM orders WHERE payment_id = $1`,
        [paymentId]
    );
    return result.rows[0] || null;
};

// Find orders by user
const findOrdersByUser = async (userId) => {
    const result = await query(
        `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
    );
    const orders = [];
    for (const row of result.rows) {
        const items = (await query(`SELECT * FROM order_items WHERE order_id = $1`, [row.id])).rows;
        orders.push(formatOrder(row, items));
    }
    return orders;
};

// Find all orders (admin)
const findAllOrders = async () => {
    const result = await query(`SELECT * FROM orders ORDER BY created_at DESC`);
    const orders = [];
    for (const row of result.rows) {
        const items = (await query(`SELECT * FROM order_items WHERE order_id = $1`, [row.id])).rows;
        orders.push(formatOrder(row, items));
    }
    return orders;
};

// Update order status
const updateOrderStatus = async (id, status) => {
    const updates = [`order_status = $1`];
    const params = [status];
    let idx = 2;

    if (status === 'Shipped') {
        updates.push(`shipped_at = NOW()`);
    }
    if (status === 'Delivered') {
        updates.push(`delivered_at = NOW()`);
    }

    params.push(id);
    await query(
        `UPDATE orders SET ${updates.join(', ')} WHERE id = $${idx}`,
        params
    );

    return findOrderById(id);
};

// Delete order
const deleteOrder = async (id) => {
    // CASCADE handles order_items
    await query(`DELETE FROM orders WHERE id = $1`, [id]);
};

module.exports = {
    formatOrder,
    createOrder,
    findOrderById,
    findOrderByPaymentId,
    findOrdersByUser,
    findAllOrders,
    updateOrderStatus,
    deleteOrder,
};