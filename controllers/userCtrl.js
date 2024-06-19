const bcrypt = require("bcrypt");
const flash = require("connect-flash");

const {generateToken} = require("../utils/generateToken");

const userModel = require("../models/userModel");
const ownerModel = require("../models/ownerModel");


const userRegistration = async (req,res)=>{
    try{
        let {fullname , email , password , contact }= req.body;
        let registeredUser = await userModel.findOne({email});
        let registeredUser2 = await userModel.findOne({contact});
        let registeredUser3 = await ownerModel.findOne({contact});

        // console.log(registeredUser);
        if (registeredUser) {
            req.flash("error" , "Account already exists");
            res.redirect("/");
        }
        else{
            let registeredOwner = await ownerModel.findOne({email});
            // console.log(registeredOwner);
            if (registeredOwner){
                req.flash("error" , "Account already exists");
                res.redirect("/");
            } 
            else{
                if (registeredUser2) {
                    req.flash("error" , "Mobile Number already registered");
                    res.redirect("/");
                }
                else {
                    if (registeredUser3){
                        req.flash("error" , "Mobile Number already registered");
                        res.redirect("/");
                    } 
                    else{
                        bcrypt.genSalt(10 , function(err , salt){
                            if(err) res.send(err.message);
                            else{
                                bcrypt.hash(password , salt , async (err,hash)=>{
                                    if(err) return res.send(err.message);
                                    else{
                                        let newUser = await userModel.create({
                                            fullname , 
                                            password : hash,
                                            email,
                                            contact,
                                        });
                                        // let token = jwt.sign({email, _id : newUser._id} , process.env.SECRET_KEY , {expiresIn : "1h"});
                                        let token = generateToken(newUser);
                                        res.cookie("token" , token);
        
                                        // res.render("shop" , {newUser : newUser});
                                        req.flash("error" , "Account created Successfully");
                                        res.redirect("/shop");
                    
                                    }
                    
                                })
                            }
                            }
                            )
                    }
                    
                }
                
            }
        }
    }catch(err){
        res.send(err.message);
    }
};

module.exports = {userRegistration};