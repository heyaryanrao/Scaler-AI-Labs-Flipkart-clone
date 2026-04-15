const { query } = require('../config/database');

// Format product row to match Mongoose output shape
const formatProduct = (row, images = [], specifications = [], reviews = []) => {
    if (!row) return null;
    return {
        _id: row.id,
        name: row.name,
        description: row.description,
        highlights: row.highlights || [],
        price: parseFloat(row.price),
        cuttedPrice: parseFloat(row.cutted_price),
        images: images.map(img => ({
            _id: img.id,
            public_id: img.public_id,
            url: img.url,
        })),
        brand: {
            name: row.brand_name,
            logo: {
                public_id: row.brand_logo_public_id,
                url: row.brand_logo_url,
            },
        },
        category: row.category,
        stock: row.stock,
        warranty: row.warranty,
        ratings: parseFloat(row.ratings) || 0,
        numOfReviews: row.num_of_reviews || 0,
        reviews: reviews.map(r => ({
            _id: r.id,
            user: r.user_id,
            name: r.name,
            rating: parseFloat(r.rating),
            comment: r.comment,
        })),
        specifications: specifications.map(s => ({
            _id: s.id,
            title: s.title,
            description: s.description,
        })),
        user: row.user_id,
        createdAt: row.created_at,
    };
};

// Create product with images & specifications
const createProduct = async (data) => {
    const result = await query(
        `INSERT INTO products (name, description, highlights, price, cutted_price, brand_name, brand_logo_public_id, brand_logo_url, category, stock, warranty, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
            data.name, data.description, data.highlights || [],
            data.price, data.cuttedPrice,
            data.brand.name, data.brand.logo.public_id, data.brand.logo.url,
            data.category, data.stock || 1, data.warranty || 1, data.user,
        ]
    );
    const product = result.rows[0];

    // Insert images
    const images = [];
    if (data.images && data.images.length > 0) {
        for (const img of data.images) {
            const imgResult = await query(
                `INSERT INTO product_images (product_id, public_id, url) VALUES ($1, $2, $3) RETURNING *`,
                [product.id, img.public_id, img.url]
            );
            images.push(imgResult.rows[0]);
        }
    }

    // Insert specifications
    const specs = [];
    if (data.specifications && data.specifications.length > 0) {
        for (const spec of data.specifications) {
            const specResult = await query(
                `INSERT INTO product_specifications (product_id, title, description) VALUES ($1, $2, $3) RETURNING *`,
                [product.id, spec.title, spec.description]
            );
            specs.push(specResult.rows[0]);
        }
    }

    return formatProduct(product, images, specs, []);
};

// Find product by ID with all related data
const findProductById = async (id) => {
    const result = await query(`SELECT * FROM products WHERE id = $1`, [id]);
    if (result.rows.length === 0) return null;

    const product = result.rows[0];
    const images = (await query(`SELECT * FROM product_images WHERE product_id = $1`, [id])).rows;
    const specs = (await query(`SELECT * FROM product_specifications WHERE product_id = $1`, [id])).rows;
    const reviews = (await query(`SELECT * FROM reviews WHERE product_id = $1`, [id])).rows;

    return formatProduct(product, images, specs, reviews);
};

// Find all products (no filters — for sliders/admin)
const findAllProducts = async () => {
    const result = await query(`SELECT * FROM products ORDER BY created_at DESC`);
    const products = [];
    for (const row of result.rows) {
        const images = (await query(`SELECT * FROM product_images WHERE product_id = $1`, [row.id])).rows;
        products.push(formatProduct(row, images, [], []));
    }
    return products;
};

// Count all products
const countProducts = async () => {
    const result = await query(`SELECT COUNT(*) as count FROM products`);
    return parseInt(result.rows[0].count);
};

// Find products with search, filter, and pagination
const findProductsFiltered = async ({ keyword, category, priceGte, priceLte, ratingsGte, page, resultPerPage }) => {
    let whereClause = [];
    let params = [];
    let idx = 1;

    if (keyword) {
        whereClause.push(`name ILIKE $${idx}`);
        params.push(`%${keyword}%`);
        idx++;
    }

    if (category) {
        whereClause.push(`category = $${idx}`);
        params.push(category);
        idx++;
    }

    if (priceGte) {
        whereClause.push(`price >= $${idx}`);
        params.push(priceGte);
        idx++;
    }

    if (priceLte) {
        whereClause.push(`price <= $${idx}`);
        params.push(priceLte);
        idx++;
    }

    if (ratingsGte) {
        whereClause.push(`ratings >= $${idx}`);
        params.push(ratingsGte);
        idx++;
    }

    const where = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';

    // Get count for filtered results (before pagination)
    const countResult = await query(`SELECT COUNT(*) as count FROM products ${where}`, params);
    const filteredProductsCount = parseInt(countResult.rows[0].count);

    // Add pagination
    const offset = resultPerPage * ((page || 1) - 1);
    const paginatedQuery = `SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(resultPerPage, offset);

    const result = await query(paginatedQuery, params);

    const products = [];
    for (const row of result.rows) {
        const images = (await query(`SELECT * FROM product_images WHERE product_id = $1`, [row.id])).rows;
        products.push(formatProduct(row, images, [], []));
    }

    return { products, filteredProductsCount };
};

// Update product
const updateProduct = async (id, data) => {
    const fields = [];
    const values = [];
    let idx = 1;

    const fieldMap = {
        name: 'name',
        description: 'description',
        highlights: 'highlights',
        price: 'price',
        cuttedPrice: 'cutted_price',
        category: 'category',
        stock: 'stock',
        warranty: 'warranty',
        ratings: 'ratings',
        numOfReviews: 'num_of_reviews',
    };

    for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
        if (data[jsKey] !== undefined) {
            fields.push(`${dbKey} = $${idx}`);
            values.push(data[jsKey]);
            idx++;
        }
    }

    // Brand fields
    if (data.brand) {
        fields.push(`brand_name = $${idx}`);
        values.push(data.brand.name);
        idx++;
        if (data.brand.logo) {
            fields.push(`brand_logo_public_id = $${idx}`);
            values.push(data.brand.logo.public_id);
            idx++;
            fields.push(`brand_logo_url = $${idx}`);
            values.push(data.brand.logo.url);
            idx++;
        }
    }

    if (fields.length > 0) {
        values.push(id);
        await query(`UPDATE products SET ${fields.join(', ')} WHERE id = $${idx}`, values);
    }

    return findProductById(id);
};

// Delete product
const deleteProduct = async (id) => {
    // CASCADE will handle images, specs, reviews
    await query(`DELETE FROM products WHERE id = $1`, [id]);
};

// Replace images for a product
const replaceImages = async (productId, images) => {
    await query(`DELETE FROM product_images WHERE product_id = $1`, [productId]);
    const inserted = [];
    for (const img of images) {
        const result = await query(
            `INSERT INTO product_images (product_id, public_id, url) VALUES ($1, $2, $3) RETURNING *`,
            [productId, img.public_id, img.url]
        );
        inserted.push(result.rows[0]);
    }
    return inserted;
};

// Replace specifications for a product
const replaceSpecifications = async (productId, specs) => {
    await query(`DELETE FROM product_specifications WHERE product_id = $1`, [productId]);
    const inserted = [];
    for (const spec of specs) {
        const result = await query(
            `INSERT INTO product_specifications (product_id, title, description) VALUES ($1, $2, $3) RETURNING *`,
            [productId, spec.title, spec.description]
        );
        inserted.push(result.rows[0]);
    }
    return inserted;
};

// Get images for a product
const getProductImages = async (productId) => {
    const result = await query(`SELECT * FROM product_images WHERE product_id = $1`, [productId]);
    return result.rows;
};

// --- Review functions ---

const findReviewByUserAndProduct = async (userId, productId) => {
    const result = await query(
        `SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2`,
        [userId, productId]
    );
    return result.rows[0] || null;
};

const createReview = async ({ productId, userId, name, rating, comment }) => {
    const result = await query(
        `INSERT INTO reviews (product_id, user_id, name, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [productId, userId, name, rating, comment]
    );
    return result.rows[0];
};

const updateReview = async (reviewId, { rating, comment }) => {
    await query(
        `UPDATE reviews SET rating = $1, comment = $2 WHERE id = $3`,
        [rating, comment, reviewId]
    );
};

const deleteReviewById = async (reviewId) => {
    await query(`DELETE FROM reviews WHERE id = $1`, [reviewId]);
};

const getReviewsByProduct = async (productId) => {
    const result = await query(`SELECT * FROM reviews WHERE product_id = $1`, [productId]);
    return result.rows;
};

const recalculateRatings = async (productId) => {
    const result = await query(
        `SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = $1`,
        [productId]
    );
    const avgRating = parseFloat(result.rows[0].avg_rating) || 0;
    const count = parseInt(result.rows[0].count) || 0;
    await query(
        `UPDATE products SET ratings = $1, num_of_reviews = $2 WHERE id = $3`,
        [avgRating, count, productId]
    );
    return { ratings: avgRating, numOfReviews: count };
};

// Update stock
const updateStock = async (productId, quantity) => {
    await query(
        `UPDATE products SET stock = stock - $1 WHERE id = $2`,
        [quantity, productId]
    );
};

module.exports = {
    formatProduct,
    createProduct,
    findProductById,
    findAllProducts,
    countProducts,
    findProductsFiltered,
    updateProduct,
    deleteProduct,
    replaceImages,
    replaceSpecifications,
    getProductImages,
    findReviewByUserAndProduct,
    createReview,
    updateReview,
    deleteReviewById,
    getReviewsByProduct,
    recalculateRatings,
    updateStock,
};