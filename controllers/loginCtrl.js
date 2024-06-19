const bcrypt = require("bcrypt");
const flash = require("connect-flash");

const userModel = require("../models/userModel");
const ownerModel = require("../models/ownerModel");

const {generateToken} = require("../utils/generateToken");

const loginCtrl = async (req,res)=>{
    let {email , password} = req.body;
    const findUser = await userModel.findOne({email});
    if (!findUser) {
        //check in owner database
        const findOwner = await ownerModel.findOne({email});
        if (!findOwner){
            req.flash("error" , "Account not registered , or either email or password is incorrect.");
            res.redirect("/");
        } 
        else{
            //login for owner
            bcrypt.compare(password , findOwner.password , (err , result)=>{
                if(err) res.send(err.message);
                else{
                    if (result) {
                        let token = generateToken(findOwner);
                        res.cookie("token" , token);
                        // res.render("admin" , {owner : findOwner});
                        res.redirect("/admin");
                    }
                    else{
                        req.flash("error" , "Either Password or Email is incorrect");
                        res.redirect("/");
                    } 
                }
            })
        }

    }else{
        //login for user
        bcrypt.compare(password , findUser.password , (err,result)=>{
            if (err) res.send(err.message);
            else{
                if (result){
                    let token = generateToken(findUser);
                    res.cookie("token" , token);
                    // res.render("shop" , {newUser : findUser});
                    res.redirect("/shop");
                } 
                else{
                    req.flash("error" , "Either Password or Email is Incorrect");
                    res.redirect("/");
                } 
            }
        })
    }
};

module.exports = {loginCtrl};