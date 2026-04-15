const {
    createProduct, findProductById, findAllProducts, countProducts,
    findProductsFiltered, updateProduct: updateProductData, deleteProduct: deleteProductById,
    replaceImages, replaceSpecifications, getProductImages,
    findReviewByUserAndProduct, createReview, updateReview,
    deleteReviewById, getReviewsByProduct, recalculateRatings,
} = require('../models/productModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const SearchFeatures = require('../utils/searchFeatures');
const ErrorHandler = require('../utils/errorHandler');
const cloudinary = require('cloudinary');

// Get All Products
exports.getAllProducts = asyncErrorHandler(async (req, res, next) => {

    const resultPerPage = 12;
    const productsCount = await countProducts();

    const searchFeatures = new SearchFeatures(req.query);
    const filters = searchFeatures.parse();
    filters.resultPerPage = resultPerPage;

    const { products, filteredProductsCount } = await findProductsFiltered(filters);

    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
    });
});

// Get All Products ---Product Sliders
exports.getProducts = asyncErrorHandler(async (req, res, next) => {
    const products = await findAllProducts();

    res.status(200).json({
        success: true,
        products,
    });
});

// Get Product Details
exports.getProductDetails = asyncErrorHandler(async (req, res, next) => {

    const product = await findProductById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    res.status(200).json({
        success: true,
        product,
    });
});

// Get All Products ---ADMIN
exports.getAdminProducts = asyncErrorHandler(async (req, res, next) => {
    const products = await findAllProducts();

    res.status(200).json({
        success: true,
        products,
    });
});

// Create Product ---ADMIN
exports.createProduct = asyncErrorHandler(async (req, res, next) => {

    let images = [];
    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    const imagesLink = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
        });

        imagesLink.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }

    const logoResult = await cloudinary.v2.uploader.upload(req.body.logo, {
        folder: "brands",
    });
    const brandLogo = {
        public_id: logoResult.public_id,
        url: logoResult.secure_url,
    };

    let specs = [];
    if (req.body.specifications) {
        req.body.specifications.forEach((s) => {
            specs.push(JSON.parse(s));
        });
    }

    const productData = {
        name: req.body.name,
        description: req.body.description,
        highlights: req.body.highlights || [],
        price: req.body.price,
        cuttedPrice: req.body.cuttedPrice,
        brand: {
            name: req.body.brandname,
            logo: brandLogo,
        },
        category: req.body.category,
        stock: req.body.stock,
        warranty: req.body.warranty,
        images: imagesLink,
        specifications: specs,
        user: req.user._id,
    };

    const product = await createProduct(productData);

    res.status(201).json({
        success: true,
        product
    });
});

// Update Product ---ADMIN
exports.updateProduct = asyncErrorHandler(async (req, res, next) => {

    let product = await findProductById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    if (req.body.images !== undefined) {
        let images = [];
        if (typeof req.body.images === "string") {
            images.push(req.body.images);
        } else {
            images = req.body.images;
        }

        // Delete old images from cloudinary
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

        const imagesLink = [];
        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });
            imagesLink.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        await replaceImages(req.params.id, imagesLink);
    }

    if (req.body.logo && req.body.logo.length > 0) {
        await cloudinary.v2.uploader.destroy(product.brand.logo.public_id);
        const result = await cloudinary.v2.uploader.upload(req.body.logo, {
            folder: "brands",
        });
        req.body.brand = {
            name: req.body.brandname,
            logo: {
                public_id: result.public_id,
                url: result.secure_url,
            },
        };
    }

    let specs = [];
    if (req.body.specifications) {
        req.body.specifications.forEach((s) => {
            specs.push(JSON.parse(s));
        });
        await replaceSpecifications(req.params.id, specs);
    }

    const updateData = {
        name: req.body.name,
        description: req.body.description,
        highlights: req.body.highlights,
        price: req.body.price,
        cuttedPrice: req.body.cuttedPrice,
        category: req.body.category,
        stock: req.body.stock,
        warranty: req.body.warranty,
    };

    if (req.body.brand) {
        updateData.brand = req.body.brand;
    }

    product = await updateProductData(req.params.id, updateData);

    res.status(201).json({
        success: true,
        product
    });
});

// Delete Product ---ADMIN
exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {

    const product = await findProductById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await deleteProductById(req.params.id);

    res.status(201).json({
        success: true
    });
});

// Create OR Update Reviews
exports.createProductReview = asyncErrorHandler(async (req, res, next) => {

    const { rating, comment, productId } = req.body;

    const product = await findProductById(productId);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    const existingReview = await findReviewByUserAndProduct(req.user._id, productId);

    if (existingReview) {
        await updateReview(existingReview.id, { rating: Number(rating), comment });
    } else {
        await createReview({
            productId,
            userId: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment,
        });
    }

    await recalculateRatings(productId);

    res.status(200).json({
        success: true
    });
});

// Get All Reviews of Product
exports.getProductReviews = asyncErrorHandler(async (req, res, next) => {

    const product = await findProductById(req.query.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews
    });
});

// Delete Review
exports.deleteReview = asyncErrorHandler(async (req, res, next) => {

    const product = await findProductById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    await deleteReviewById(req.query.id);
    await recalculateRatings(req.query.productId);

    res.status(200).json({
        success: true,
    });
});