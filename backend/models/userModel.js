const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../config/database');

// --- Helper functions (replacing Mongoose instance methods) ---

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

const comparePassword = async (enteredPassword, hashedPassword) => {
    return await bcrypt.compare(enteredPassword, hashedPassword);
};

const getJWTToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

const getResetPasswordToken = () => {
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    return { resetToken, resetPasswordToken, resetPasswordExpire };
};

// Format user row to match Mongoose output shape
const formatUser = (row) => {
    if (!row) return null;
    return {
        _id: row.id,
        name: row.name,
        email: row.email,
        gender: row.gender,
        avatar: {
            public_id: row.avatar_public_id,
            url: row.avatar_url,
        },
        role: row.role,
        createdAt: row.created_at,
        // include password only when explicitly selected
        ...(row.password ? { password: row.password } : {}),
    };
};

// --- Query functions ---

const createUser = async ({ name, email, gender, password, avatar }) => {
    const hashedPassword = await hashPassword(password);
    const result = await query(
        `INSERT INTO users (name, email, gender, password, avatar_public_id, avatar_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, email, gender, avatar_public_id, avatar_url, role, created_at`,
        [name, email, gender, hashedPassword, avatar.public_id, avatar.url]
    );
    return formatUser(result.rows[0]);
};

const findUserByEmail = async (email) => {
    const result = await query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );
    return formatUser(result.rows[0]);
};

const findUserById = async (id) => {
    const result = await query(
        `SELECT id, name, email, gender, avatar_public_id, avatar_url, role, created_at FROM users WHERE id = $1`,
        [id]
    );
    return formatUser(result.rows[0]);
};

const findUserByIdWithPassword = async (id) => {
    const result = await query(
        `SELECT * FROM users WHERE id = $1`,
        [id]
    );
    return formatUser(result.rows[0]);
};

const updateUser = async (id, data) => {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
    }
    values.push(id);

    const result = await query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}
         RETURNING id, name, email, gender, avatar_public_id, avatar_url, role, created_at`,
        values
    );
    return formatUser(result.rows[0]);
};

const findAllUsers = async () => {
    const result = await query(
        `SELECT id, name, email, gender, avatar_public_id, avatar_url, role, created_at FROM users`
    );
    return result.rows.map(formatUser);
};

const deleteUser = async (id) => {
    await query(`DELETE FROM users WHERE id = $1`, [id]);
};

const setResetToken = async (id, token, expire) => {
    await query(
        `UPDATE users SET reset_password_token = $1, reset_password_expire = $2 WHERE id = $3`,
        [token, expire, id]
    );
};

const findByResetToken = async (token) => {
    const result = await query(
        `SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expire > NOW()`,
        [token]
    );
    return formatUser(result.rows[0]);
};

const updatePassword = async (id, password) => {
    const hashedPassword = await hashPassword(password);
    await query(
        `UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expire = NULL WHERE id = $2`,
        [hashedPassword, id]
    );
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    findUserByIdWithPassword,
    updateUser,
    findAllUsers,
    deleteUser,
    setResetToken,
    findByResetToken,
    updatePassword,
    comparePassword,
    getJWTToken,
    getResetPasswordToken,
    hashPassword,
    formatUser,
};