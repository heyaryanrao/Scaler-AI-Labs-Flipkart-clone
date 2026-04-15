const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

// Helper to run queries
const query = (text, params) => pool.query(text, params);

// Initialize all tables
const initDB = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('PostgreSQL Connected (Neon)');

        // Users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                gender VARCHAR(50) NOT NULL,
                password VARCHAR(255) NOT NULL,
                avatar_public_id VARCHAR(255),
                avatar_url VARCHAR(512),
                role VARCHAR(50) DEFAULT 'user',
                reset_password_token VARCHAR(255),
                reset_password_expire TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // Products table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                highlights TEXT[],
                price NUMERIC(10,2) NOT NULL,
                cutted_price NUMERIC(10,2) NOT NULL,
                brand_name VARCHAR(255) NOT NULL,
                brand_logo_public_id VARCHAR(255) NOT NULL,
                brand_logo_url VARCHAR(512) NOT NULL,
                category VARCHAR(255) NOT NULL,
                stock INTEGER DEFAULT 1,
                warranty INTEGER DEFAULT 1,
                ratings NUMERIC(3,2) DEFAULT 0,
                num_of_reviews INTEGER DEFAULT 0,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // Product Images
        await pool.query(`
            CREATE TABLE IF NOT EXISTS product_images (
                id SERIAL PRIMARY KEY,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                public_id VARCHAR(255) NOT NULL,
                url VARCHAR(512) NOT NULL
            );
        `);

        // Product Specifications
        await pool.query(`
            CREATE TABLE IF NOT EXISTS product_specifications (
                id SERIAL PRIMARY KEY,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL
            );
        `);

        // Reviews
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                name VARCHAR(255) NOT NULL,
                rating NUMERIC(3,2) NOT NULL,
                comment TEXT NOT NULL
            );
        `);

        // Orders
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                shipping_address VARCHAR(500) NOT NULL,
                shipping_city VARCHAR(255) NOT NULL,
                shipping_state VARCHAR(255) NOT NULL,
                shipping_country VARCHAR(255) NOT NULL,
                shipping_pincode INTEGER NOT NULL,
                shipping_phone BIGINT NOT NULL,
                payment_id VARCHAR(255) NOT NULL,
                payment_status VARCHAR(100) NOT NULL,
                paid_at TIMESTAMPTZ NOT NULL,
                total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
                order_status VARCHAR(100) DEFAULT 'Processing',
                delivered_at TIMESTAMPTZ,
                shipped_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // Order Items
        await pool.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
                name VARCHAR(255) NOT NULL,
                price NUMERIC(10,2) NOT NULL,
                quantity INTEGER NOT NULL,
                image VARCHAR(512) NOT NULL
            );
        `);

        // Payments
        await pool.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                order_id VARCHAR(255),
                txn_id VARCHAR(255),
                txn_amount VARCHAR(50),
                status VARCHAR(100),
                result_code VARCHAR(50),
                result_msg TEXT,
                result_status VARCHAR(50),
                bank_name VARCHAR(255),
                gateway_name VARCHAR(255),
                payment_mode VARCHAR(100),
                mid VARCHAR(255),
                txn_date TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        console.log('All tables initialized');
    } catch (err) {
        console.log(`Database Error: ${err.message}`);
        throw err;
    }
};

module.exports = { query, initDB, pool };