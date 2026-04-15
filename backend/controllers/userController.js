const {
    createUser, findUserByEmail, findUserById, findUserByIdWithPassword,
    updateUser, findAllUsers, deleteUser: deleteUserById,
    setResetToken, findByResetToken, updatePassword: updateUserPassword,
    comparePassword, getJWTToken, getResetPasswordToken,
} = require('../models/userModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const sendToken = require('../utils/sendToken');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const cloudinary = require('cloudinary');

// Register User
exports.registerUser = asyncErrorHandler(async (req, res, next) => {

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
    });

    const { name, email, gender, password } = req.body;

    const user = await createUser({
        name,
        email,
        gender,
        password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        },
    });

    const token = getJWTToken(user._id);
    sendTokenResponse(user, token, 201, res);
});

// Login User
exports.loginUser = asyncErrorHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email And Password", 400));
    }

    const user = await findUserByEmail(email);

    if (!user) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    const isPasswordMatched = await comparePassword(password, user.password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    const token = getJWTToken(user._id);
    // Remove password from response
    delete user.password;
    sendTokenResponse(user, token, 201, res);
});

// Logout User
exports.logoutUser = asyncErrorHandler(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged Out",
    });
});

// Get User Details
exports.getUserDetails = asyncErrorHandler(async (req, res, next) => {

    const user = await findUserById(req.user._id);

    res.status(200).json({
        success: true,
        user,
    });
});

// Forgot Password
exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {

    const user = await findUserByEmail(req.body.email);

    if (!user) {
        return next(new ErrorHandler("User Not Found", 404));
    }

    const { resetToken, resetPasswordToken, resetPasswordExpire } = getResetPasswordToken();

    await setResetToken(user._id, resetPasswordToken, resetPasswordExpire);

    const resetPasswordUrl = `https://${req.get("host")}/password/reset/${resetToken}`;

    try {
        await sendEmail({
            email: user.email,
            templateId: process.env.SENDGRID_RESET_TEMPLATEID,
            data: {
                reset_url: resetPasswordUrl
            }
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });

    } catch (error) {
        await setResetToken(user._id, null, null);
        return next(new ErrorHandler(error.message, 500))
    }
});

// Reset Password
exports.resetPassword = asyncErrorHandler(async (req, res, next) => {

    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await findByResetToken(resetPasswordToken);

    if (!user) {
        return next(new ErrorHandler("Invalid reset password token", 404));
    }

    await updateUserPassword(user._id, req.body.password);

    const updatedUser = await findUserById(user._id);
    const token = getJWTToken(updatedUser._id);
    sendTokenResponse(updatedUser, token, 200, res);
});

// Update Password
exports.updatePassword = asyncErrorHandler(async (req, res, next) => {

    const user = await findUserByIdWithPassword(req.user._id);

    const isPasswordMatched = await comparePassword(req.body.oldPassword, user.password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old Password is Invalid", 400));
    }

    await updateUserPassword(user._id, req.body.newPassword);

    const updatedUser = await findUserById(user._id);
    const token = getJWTToken(updatedUser._id);
    sendTokenResponse(updatedUser, token, 201, res);
});

// Update User Profile
exports.updateProfile = asyncErrorHandler(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    if (req.body.avatar !== "") {
        const user = await findUserById(req.user._id);

        const imageId = user.avatar.public_id;

        if (imageId) {
            await cloudinary.v2.uploader.destroy(imageId);
        }

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        });

        newUserData.avatar_public_id = myCloud.public_id;
        newUserData.avatar_url = myCloud.secure_url;
    }

    await updateUser(req.user._id, newUserData);

    res.status(200).json({
        success: true,
    });
});

// ADMIN DASHBOARD

// Get All Users --ADMIN
exports.getAllUsers = asyncErrorHandler(async (req, res, next) => {

    const users = await findAllUsers();

    res.status(200).json({
        success: true,
        users,
    });
});

// Get Single User Details --ADMIN
exports.getSingleUser = asyncErrorHandler(async (req, res, next) => {

    const user = await findUserById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User doesn't exist with id: ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        user,
    });
});

// Update User Role --ADMIN
exports.updateUserRole = asyncErrorHandler(async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender,
        role: req.body.role,
    };

    await updateUser(req.params.id, newUserData);

    res.status(200).json({
        success: true,
    });
});

// Delete User --ADMIN
exports.deleteUser = asyncErrorHandler(async (req, res, next) => {

    const user = await findUserById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User doesn't exist with id: ${req.params.id}`, 404));
    }

    await deleteUserById(req.params.id);

    res.status(200).json({
        success: true
    });
});

// Helper to send token via cookie
function sendTokenResponse(user, token, statusCode, res) {
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user,
        token,
    });
}