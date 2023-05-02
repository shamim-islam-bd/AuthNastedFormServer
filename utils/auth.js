
const jwt = require('jsonwebtoken');
const User = require('../models/userModel').default;
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



// User Authentications form here.
// exports.isAuthentication = async (req, res, next) => {
//     let token

//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith('Bearer')
//     ) {
//       try {
//         // Get token from header
//         token = req.headers.authorization.split(' ')[1]
  
//         // Verify token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET)
  
//         // Get user from the token
//         req.user = await User.findById(decoded.id).select('-password')
  
//         next()
//       } catch (error) {
//         console.log(error)
//         res.status(401)
//         throw new Error('Not authorized')
//       }
//     }
  
//     if (!token) {
//       res.status(401)
//       throw new Error('Not authorized, no token')
//     }
// }
