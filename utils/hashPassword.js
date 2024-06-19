const bcrypt = require("bcrypt");

const userModel = require("../models/userModel");

const {generateToken} = require("../utils/generateToken");
const { model } = require("mongoose");


const hashPassword = bcrypt.genSalt(10 , function(err , salt){
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

                res.render("shop");

            }

        })
    }
    }
);

module.exports = {hashPassword};