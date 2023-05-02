// Set up user schema using Mongoose
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

// Hash password before storing in the database
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  next();
});


// compare password......
// userSchema.methods.comparePassword = async function(enteredpassword){
//   // console.log("enteredpassword: ", enteredpassword);
//   const user = this;
//   const pass = await bcrypt.compare(enteredpassword, user.password)
//   console.log("pass schema: ", pass, enteredpassword, user.password);
//   return pass;
// }



userSchema.methods.comparePassword = async function(enteredpassword){
  console.log("enteredpassword: ", enteredpassword);
  const user = this;
  bcrypt.compare(enteredpassword, user.password, function(err, result) {
  if (err) {
    console.error(err);
  } else {
    console.log("result: ", result,  user.password); // true if the password matches the hash, false otherwise
  }
});

}




// JWT Token generate- used it in userControler.
userSchema.methods.getJWTToken = function(){
  const jwtProcess = jwt.sign({id: this._id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  return jwtProcess;
}




const User = mongoose.model('User', userSchema);
 
module.exports = User;