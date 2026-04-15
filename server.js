const path = require('path');
const express = require('express');
const cloudinary = require('cloudinary');
const app = require('./flipkart/backend/app');
const { initDB } = require('./flipkart/backend/config/database');
const PORT = process.env.PORT || 4000;

// UncaughtException Error
process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`);
    process.exit(1);
});

// Initialize database tables and start server
(async () => {
    try {
        await initDB();

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        // deployment
        const __dirnamePath = path.resolve();
        if (process.env.NODE_ENV === 'production') {
            app.use(express.static(path.join(__dirnamePath, '/frontend/build')))

            app.get('*', (req, res) => {
                res.sendFile(path.resolve(__dirnamePath, 'frontend', 'build', 'index.html'))
            });
        } else {
            app.get('/', (req, res) => {
                res.send('Server is Running! 🚀');
            });
        }

        const server = app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`)
        });

        // Unhandled Promise Rejection
        process.on('unhandledRejection', (err) => {
            console.log(`Error: ${err.message}`);
            server.close(() => {
                process.exit(1);
            });
        });

    } catch (err) {
        console.log(`Failed to start server: ${err.message}`);
        process.exit(1);
    }
})();
