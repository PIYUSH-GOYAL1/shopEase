const ownerModel = require("../models/ownerModel");
const userModel = require("../models/userModel");

const flash = require("connect-flash");

const jwt = require("jsonwebtoken");

const isAdmin = async (req,res , next)=>{
    try{
        let decoded = jwt.verify(req.cookies.token , process.env.SECRET_KEY);
        let user = await userModel.findOne({email : decoded.email}).select("-password");
        if (!user){
            let owner = await ownerModel.findOne({email : decoded.email}).select("-password");
            if(owner){
                return next()
            }else{
                req.flash("error" , "Something Went Wrong 02");
                res.redirect("/");
                // req.isAdmin = false;
            };
        }else{
            req.flash("error" , "You are Not an admin");
            res.redirect("/shop");
        }

        next();
    }catch(err){
        req.flash("error" , "Something Went Wrong.")
        res.redirect("/shop")
    }
};

module.exports = { isAdmin };