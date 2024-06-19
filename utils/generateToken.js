const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (user)=>{
    return jwt.sign({email : user.email , user_id : user._id} , process.env.SECRET_KEY , {expiresIn : "1h"});
};

module.exports.generateToken = generateToken;