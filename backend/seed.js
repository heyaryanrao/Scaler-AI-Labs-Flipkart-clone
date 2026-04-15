/**
 * Seed script to populate the PostgreSQL database with sample data.
 * 
 * Usage: node backend/seed.js
 * 
 * Make sure to set DATABASE_URL in your backend/config/config.env file first.
 * This script creates a sample admin user and 12 sample products.
 */

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: 'backend/config/config.env' });
}

const { initDB, query, pool } = require('./config/database');
const bcrypt = require('bcryptjs');

const sampleProducts = [
    {
        name: "Samsung Galaxy S23 Ultra 5G",
        description: "Samsung Galaxy S23 Ultra 5G with built-in S Pen, 200MP camera, Snapdragon 8 Gen 2 processor, and a stunning 6.8-inch Dynamic AMOLED display.",
        highlights: ["200MP Camera", "S Pen Built-in", "Snapdragon 8 Gen 2", "5000mAh Battery"],
        price: 124999,
        cutted_price: 149999,
        brand_name: "Samsung",
        brand_logo_public_id: "brands/samsung",
        brand_logo_url: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
        category: "Smartphones",
        stock: 25,
        warranty: 1,
        images: [
            { public_id: "products/samsung_s23_1", url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600" },
            { public_id: "products/samsung_s23_2", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600" },
        ],
        specifications: [
            { title: "Display", description: "6.8-inch Dynamic AMOLED 2X" },
            { title: "Processor", description: "Snapdragon 8 Gen 2" },
            { title: "RAM", description: "12 GB" },
            { title: "Storage", description: "256 GB" },
        ],
    },
    {
        name: "Apple iPhone 15 Pro Max",
        description: "iPhone 15 Pro Max features a titanium design, A17 Pro chip, 48MP camera system, and Action button.",
        highlights: ["A17 Pro Chip", "Titanium Design", "48MP Camera", "USB-C"],
        price: 159900,
        cutted_price: 179900,
        brand_name: "Apple",
        brand_logo_public_id: "brands/apple",
        brand_logo_url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
        category: "Smartphones",
        stock: 15,
        warranty: 1,
        images: [
            { public_id: "products/iphone15_1", url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600" },
            { public_id: "products/iphone15_2", url: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600" },
        ],
        specifications: [
            { title: "Display", description: "6.7-inch Super Retina XDR" },
            { title: "Processor", description: "A17 Pro" },
            { title: "RAM", description: "8 GB" },
            { title: "Storage", description: "256 GB" },
        ],
    },
    {
        name: "Sony WH-1000XM5 Wireless Headphones",
        description: "Industry-leading noise canceling headphones with Auto NC Optimizer, exceptional sound quality, and 30-hour battery life.",
        highlights: ["Industry-leading ANC", "30hr Battery", "Multipoint Connection", "Speak-to-Chat"],
        price: 26990,
        cutted_price: 34990,
        brand_name: "Sony",
        brand_logo_public_id: "brands/sony",
        brand_logo_url: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg",
        category: "Electronics",
        stock: 50,
        warranty: 1,
        images: [
            { public_id: "products/sony_xm5_1", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600" },
        ],
        specifications: [
            { title: "Driver", description: "30mm" },
            { title: "Battery Life", description: "30 hours" },
            { title: "Weight", description: "250g" },
        ],
    },
    {
        name: "Nike Air Max 270",
        description: "The Nike Air Max 270 features Nike's biggest heel Air unit yet for a super-soft ride that feels as impossible as it looks.",
        highlights: ["Max Air Unit", "Breathable Mesh", "Foam Midsole", "Rubber Outsole"],
        price: 13995,
        cutted_price: 15995,
        brand_name: "Nike",
        brand_logo_public_id: "brands/nike",
        brand_logo_url: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
        category: "Footwear",
        stock: 100,
        warranty: 0,
        images: [
            { public_id: "products/nike_270_1", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600" },
            { public_id: "products/nike_270_2", url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600" },
        ],
        specifications: [
            { title: "Material", description: "Mesh upper, Rubber sole" },
            { title: "Closure", description: "Lace-up" },
            { title: "Air Unit", description: "270-degree" },
        ],
    },
    {
        name: "Dell XPS 15 Laptop",
        description: "Dell XPS 15 with 12th Gen Intel Core i7, 16GB RAM, 512GB SSD, NVIDIA GeForce RTX 3050, and a stunning 15.6-inch OLED display.",
        highlights: ["12th Gen Intel i7", "RTX 3050", "15.6\" OLED", "16GB RAM"],
        price: 149990,
        cutted_price: 174990,
        brand_name: "Dell",
        brand_logo_public_id: "brands/dell",
        brand_logo_url: "https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg",
        category: "Laptops",
        stock: 10,
        warranty: 2,
        images: [
            { public_id: "products/dell_xps_1", url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600" },
        ],
        specifications: [
            { title: "Processor", description: "Intel Core i7-12700H" },
            { title: "RAM", description: "16 GB DDR5" },
            { title: "Storage", description: "512 GB NVMe SSD" },
            { title: "GPU", description: "NVIDIA GeForce RTX 3050" },
        ],
    },
    {
        name: "Levi's 501 Original Fit Jeans",
        description: "The original blue jean since 1873. Levi's 501 is the blueprint for all jeans to follow — iconic straight fit with button fly.",
        highlights: ["100% Cotton", "Button Fly", "Straight Fit", "Classic 5-pocket"],
        price: 3999,
        cutted_price: 5999,
        brand_name: "Levi's",
        brand_logo_public_id: "brands/levis",
        brand_logo_url: "https://upload.wikimedia.org/wikipedia/commons/7/75/Levi%27s_logo.svg",
        category: "Fashion",
        stock: 200,
        warranty: 0,
        images: [
            { public_id: "products/levis_501_1", url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600" },
        ],
        specifications: [
            { title: "Material", description: "100% Cotton Denim" },
            { title: "Fit", description: "Straight" },
            { title: "Rise", description: "Regular" },
        ],
    },
    {
        name: "Apple MacBook Air M2",
        description: "Supercharged by the M2 chip, MacBook Air features a strikingly thin design, 13.6-inch Liquid Retina display, and up to 18 hours of battery life.",
        highlights: ["M2 Chip", "13.6\" Liquid Retina", "18hr Battery", "MagSafe Charging"],
        price: 114900,
        cutted_price: 129900,
        brand_name: "Apple",
        brand_logo_public_id: "brands/apple",
        brand_logo_url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
        category: "Laptops",
        stock: 20,
        warranty: 1,
        images: [
            { public_id: "products/macbook_m2_1", url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600" },
        ],
        specifications: [
            { title: "Chip", description: "Apple M2" },
            { title: "RAM", description: "8 GB unified" },
            { title: "Storage", description: "256 GB SSD" },
            { title: "Display", description: "13.6-inch Liquid Retina" },
        ],
    },
    {
        name: "boAt Airdopes 441 Earbuds",
        description: "boAt Airdopes 441 TWS earbuds with IWP Technology, Bluetooth v5.0, immersive audio, and up to 30 hours of total playback time.",
        highlights: ["IWP Technology", "30hr Playback", "IPX7 Water Resistant", "Touch Controls"],
        price: 1299,
        cutted_price: 4490,
        brand_name: "boAt",
        brand_logo_public_id: "brands/boat",
        brand_logo_url: "https://upload.wikimedia.org/wikipedia/commons/4/4a/BOAT_Logo.png",
        category: "Electronics",
        stock: 300,
        warranty: 1,
        images: [
            { public_id: "products/boat_441_1", url: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600" },
        ],
        specifications: [
            { title: "Driver Size", description: "6mm" },
            { title: "Battery", description: "500mAh (case)" },
            { title: "Bluetooth", description: "v5.0" },
        ],
    },
    {
        name: "Canon EOS R6 Mark II",
        description: "Full-frame mirrorless camera with 24.2MP sensor, advanced Dual Pixel CMOS AF II, 4K 60p video, and up to 40fps continuous shooting.",
        highlights: ["24.2MP Full Frame", "4K 60p Video", "40fps Burst", "Dual Pixel AF II"],
        price: 227995,
        cutted_price: 255995,
        brand_name: "Canon",
        brand_logo_public_id: "brands/canon",
        brand_logo_url: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Canon_wordmark.svg",
        category: "Electronics",
        stock: 8,
        warranty: 2,
        images: [
            { public_id: "products/canon_r6_1", url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600" },
            { public_id: "products/canon_r6_2", url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600" },
        ],
        specifications: [
            { title: "Sensor", description: "24.2MP Full Frame CMOS" },
            { title: "ISO Range", description: "100-102400" },
            { title: "Video", description: "4K 60p / Full HD 180p" },
            { title: "AF Points", description: "1053" },
        ],
    },
    {
        name: "Puma RS-X Sneakers",
        description: "PUMA RS-X reinvents the chunky sneaker trend with bold colors and extreme proportions for a statement-making silhouette.",
        highlights: ["RS Cushioning", "Mesh Upper", "Rubber Outsole", "Chunky Design"],
        price: 8999,
        cutted_price: 10999,
        brand_name: "Puma",
        brand_logo_public_id: "brands/puma",
        brand_logo_url: "https://upload.wikimedia.org/wikipedia/commons/d/da/Puma_complete_logo.svg",
        category: "Footwear",
        stock: 75,
        warranty: 0,
        images: [
            { public_id: "products/puma_rsx_1", url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600" },
        ],
        specifications: [
            { title: "Material", description: "Mesh and Leather" },
            { title: "Sole", description: "Rubber" },
            { title: "Closure", description: "Lace-up" },
        ],
    },
    {
        name: "Realme Pad X Tablet",
        description: "Realme Pad X with 11-inch 2K display, Snapdragon 695 processor, 8GB RAM, and 8340mAh battery for all-day productivity.",
        highlights: ["11\" 2K Display", "Snapdragon 695", "8GB RAM", "8340mAh Battery"],
        price: 19999,
        cutted_price: 24999,
        brand_name: "Realme",
        brand_logo_public_id: "brands/realme",
        brand_logo_url: "https://upload.wikimedia.org/wikipedia/commons/9/91/Realme_logo.png",
        category: "Electronics",
        stock: 30,
        warranty: 1,
        images: [
            { public_id: "products/realme_pad_1", url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600" },
        ],
        specifications: [
            { title: "Display", description: "11-inch 2K IPS" },
            { title: "Processor", description: "Snapdragon 695" },
            { title: "RAM", description: "8 GB" },
            { title: "Battery", description: "8340 mAh" },
        ],
    },
    {
        name: "Allen Solly Formal Shirt",
        description: "Allen Solly Men's Slim Fit formal shirt in premium cotton with a contemporary spread collar and full sleeves.",
        highlights: ["100% Premium Cotton", "Slim Fit", "Spread Collar", "Machine Washable"],
        price: 1499,
        cutted_price: 2499,
        brand_name: "Allen Solly",
        brand_logo_public_id: "brands/allensolly",
        brand_logo_url: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Allen_Solly_logo.png",
        category: "Fashion",
        stock: 150,
        warranty: 0,
        images: [
            { public_id: "products/allensolly_1", url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600" },
        ],
        specifications: [
            { title: "Material", description: "100% Cotton" },
            { title: "Fit", description: "Slim" },
            { title: "Sleeve", description: "Full Sleeve" },
            { title: "Collar", description: "Spread" },
        ],
    },
];

async function seed() {
    try {
        console.log('Initializing database...');
        await initDB();

        // Check if data already exists
        const existingProducts = await query('SELECT COUNT(*) as count FROM products');
        if (parseInt(existingProducts.rows[0].count) > 0) {
            console.log('Database already has products. Skipping seed.');
            await pool.end();
            return;
        }

        // Create an admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const userResult = await query(
            `INSERT INTO users (name, email, gender, password, role, avatar_public_id, avatar_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            ['Admin User', 'admin@flipkart.com', 'male', hashedPassword, 'admin',
             'avatars/admin', 'https://ui-avatars.com/api/?name=Admin+User&background=2874f0&color=fff']
        );
        const adminId = userResult.rows[0].id;
        console.log(`Created admin user (id: ${adminId}) — email: admin@flipkart.com / password: admin123`);

        // Create a test user
        const testPassword = await bcrypt.hash('test1234', 10);
        const testUserResult = await query(
            `INSERT INTO users (name, email, gender, password, role, avatar_public_id, avatar_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            ['Test User', 'test@flipkart.com', 'male', testPassword, 'user',
             'avatars/test', 'https://ui-avatars.com/api/?name=Test+User&background=ff6161&color=fff']
        );
        console.log(`Created test user (id: ${testUserResult.rows[0].id}) — email: test@flipkart.com / password: test1234`);

        // Insert products
        for (const p of sampleProducts) {
            const productResult = await query(
                `INSERT INTO products (name, description, highlights, price, cutted_price, brand_name, brand_logo_public_id, brand_logo_url, category, stock, warranty, user_id)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                 RETURNING id`,
                [p.name, p.description, p.highlights, p.price, p.cutted_price,
                 p.brand_name, p.brand_logo_public_id, p.brand_logo_url,
                 p.category, p.stock, p.warranty, adminId]
            );
            const productId = productResult.rows[0].id;

            // Insert images
            for (const img of p.images) {
                await query(
                    `INSERT INTO product_images (product_id, public_id, url) VALUES ($1, $2, $3)`,
                    [productId, img.public_id, img.url]
                );
            }

            // Insert specifications
            for (const spec of p.specifications) {
                await query(
                    `INSERT INTO product_specifications (product_id, title, description) VALUES ($1, $2, $3)`,
                    [productId, spec.title, spec.description]
                );
            }

            console.log(`  ✓ Created product: ${p.name}`);
        }

        console.log(`\n✅ Seed complete! ${sampleProducts.length} products created.`);
        console.log('\nLogin credentials:');
        console.log('  Admin: admin@flipkart.com / admin123');
        console.log('  User:  test@flipkart.com / test1234');

        await pool.end();
    } catch (err) {
        console.error('Seed failed:', err.message);
        await pool.end();
        process.exit(1);
    }
}

seed();
