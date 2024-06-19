const bcrypt = require("bcrypt");
const ownerModel = require("../models/ownerModel");



const createOwner = async (req,res)=>{

    // const Owner = ownerModel.findAll({isSubOwner : false});
    bcrypt.genSalt(10 , function(err , salt){
        if(err) res.send(err.message);
        else{
            bcrypt.hash(process.env.OWNER_PASSWORD , salt , async (err,hash)=>{
                if(err) return res.send(err.message);
                else{
                    const owner = await ownerModel.create({
                        fullname : process.env.FULLNAME, 
                        password : hash,
                        email: process.env.EMAIL,
                        contact : process.env.CONTACT,
                        isSubOwner : false,
                    });
                    res.send(owner);
}})
}})

};

module.exports = {createOwner};