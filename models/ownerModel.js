const {default : mongoose} = require("mongoose");
// const defaultImageBuffer = require("../config/defaultImage");
const {defaultImageBuffer , defaultProductBuffer} = require("../config/defaultImage");


const ownerSchema = mongoose.Schema({
    fullname : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
        unique : true,
    },
    contact : {
        type : String,
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
    password : {
        type : String,
        required : true,
    },
    isSubOwner : {
        type : Boolean,
        default : true,
    },
    product : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "product",
    }],
    order : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "order",
    }],
    user : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
    }],
    review : [{
        type : mongoose.Schema.Types.ObjectId,
        ref :"review",
    }],
    complaint : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "complaint",
    }],
    joining_date : {
        type : Date,
        default : Date.now,
    },
});

module.exports = mongoose.model("owner" , ownerSchema);