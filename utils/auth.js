
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
// const { Error } = require('mongoose');

exports.isAuthentication = async (req, res, next) => {

    // console.log(req.headers.authorization);

    // split the token from the header and get the token
    const token = req.headers.authorization.split('Bearer ')[1];
    // console.log(token);

    if (!token) {
        return res.status(401).json({ message: "please login" });
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decode.id);
        next();
    } catch (error) {
        return res.status(401).json({ message: "please login" });
    }
}
