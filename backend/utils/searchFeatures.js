// SearchFeatures is no longer needed as a Mongoose query chain builder.
// Search, filter, and pagination are now handled directly in productModel.js
// via SQL WHERE/ILIKE/LIMIT/OFFSET clauses.
//
// This file is kept for backward compatibility but exports a no-op.
// The actual search logic lives in productModel.findProductsFiltered()

class SearchFeatures {
    constructor(queryParams) {
        this.queryParams = queryParams;
    }

    // Parse query params into filter object for productModel
    parse() {
        const { keyword, category, page } = this.queryParams;
        const priceGte = this.queryParams['price[gte]'] || this.queryParams.price?.gte;
        const priceLte = this.queryParams['price[lte]'] || this.queryParams.price?.lte;
        const ratingsGte = this.queryParams['ratings[gte]'] || this.queryParams.ratings?.gte;

        return {
            keyword: keyword || null,
            category: category || null,
            priceGte: priceGte ? parseFloat(priceGte) : null,
            priceLte: priceLte ? parseFloat(priceLte) : null,
            ratingsGte: ratingsGte ? parseFloat(ratingsGte) : null,
            page: parseInt(page) || 1,
        };
    }
}

module.exports = SearchFeatures;