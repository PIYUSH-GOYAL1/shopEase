const jwt = require("jsonwebtoken");
const flash = require("connect-flash");

const userModel = require("../models/userModel");
const ownerModel = require("../models/ownerModel");

const isLoggedIn = async (req,res,next)=>{
    if (!req.cookies.token){
        // res.send("You Need To login First.");
        req.flash("error" , "You Need To Login First");
        res.redirect('/');
    }

    try{
        let decoded = jwt.verify(req.cookies.token , process.env.SECRET_KEY);
        let user = await userModel.findOne({email : decoded.email}).select("-password");
        if (!user){
            let owner = await ownerModel.findOne({email : decoded.email}).select("-password");
            req.user = owner;
        }else{
        req.user = user;
        }
        next();
    }catch(err){
        req.flash("error" , "Something went wrong");
        res.redirect("/");
    }
};

module.exports = {isLoggedIn};
