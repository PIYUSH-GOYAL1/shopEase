const {default : mongoose} = require("mongoose");
const {defaultImageBuffer , defaultProductBuffer} = require("../config/defaultImage");

const productSchema = mongoose.Schema({
    product_name : {
        type : String,
        required : true,
        unique : true,
    },
    category : {
        type : String,
        required : true,
    },
    price : {
        type : Number,
        required : true,
    },
    selling_price : {
        type : Number,
    },
    discount : {
        type : Number,
        default : 0,
    },
    quantity_available : {
        type : Number,
    },
    description : {
        type : String,
        required : true,
    },
    rating : {
        type : Number,
        min : 0,
        max : 5,
        default : 2.5,
    },
    review : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "review"
        }
    ],
    product_image : {
        type : Buffer,
        default : defaultProductBuffer,
    },
    created_at : {
        type : Date,
        default : Date.now,
    },
    created_by : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "owner",
    },
    purchased_by : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
    }],
    review : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "review",
    }],
    complaint : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "complaint",
    }],
    order : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "order",
    }],
});

module.exports = mongoose.model("product" , productSchema);