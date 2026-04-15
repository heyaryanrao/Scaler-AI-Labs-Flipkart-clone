const { query } = require('../config/database');

const createPayment = async (data) => {
    const result = await query(
        `INSERT INTO payments (order_id, txn_id, txn_amount, status, result_code, result_msg, result_status, bank_name, gateway_name, payment_mode, mid, txn_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
            data.orderId || null,
            data.txnId || null,
            data.txnAmount || null,
            data.status || null,
            data.resultInfo?.resultCode || null,
            data.resultInfo?.resultMsg || null,
            data.resultInfo?.resultStatus || null,
            data.bankName || null,
            data.gatewayName || null,
            data.paymentMode || null,
            data.mid || null,
            data.txnDate || null,
        ]
    );
    return result.rows[0];
};

const findPaymentByOrderId = async (orderId) => {
    const result = await query(
        `SELECT * FROM payments WHERE order_id = $1`,
        [orderId]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
        _id: row.id,
        orderId: row.order_id,
        txnId: row.txn_id,
        txnAmount: row.txn_amount,
        resultInfo: {
            resultCode: row.result_code,
            resultMsg: row.result_msg,
            resultStatus: row.result_status,
        },
        bankName: row.bank_name,
        gatewayName: row.gateway_name,
        paymentMode: row.payment_mode,
        mid: row.mid,
        txnDate: row.txn_date,
    };
};

module.exports = {
    createPayment,
    findPaymentByOrderId,
};