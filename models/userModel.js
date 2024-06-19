const {default : mongoose} = require("mongoose");
const {defaultImageBuffer , defaultProductBuffer} = require("../config/defaultImage");


const userSchema = mongoose.Schema({
    fullname : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
        unique : true,
    },
    password : {
        type : String,
        required : true
    },
    contact : {
        type : Number,
        required : true,
        unique : true,
    },
    address : {
        type : String,
    },
    dob : {
        type : Date,
    },
    profilepic : {
        type : Buffer,
        default : defaultImageBuffer,
    },
    cart : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "product",
    }],
    order : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "order",
        }
    ],
    review : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "review",
        }
    ],
    complaint : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "complaint",
    }],
    isBan : {
        type : Boolean,
        default : false,
    },
    joining_date : {
        type : Date,
        default : Date.now,
    }

});

module.exports = mongoose.model("user" , userSchema);