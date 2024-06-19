const {default : mongoose} = require("mongoose");

const orderSchema = mongoose.Schema({
    product_list : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "product",
        }
           
    ],
    order_date : {
        type : Date,
        default : Date.now,
    },
    total_amount : {
        type : Number,
    },
    shipping_address : {
        type : String,
    },
    // payment_method : {
    //     type : String,
    // },
    status : {
        type : String,
        default : "processing",
    },
    purchased_by : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
    },
    order_manager : [{
        type :mongoose.Schema.Types.ObjectId,
        ref : "owner",
    }],
    is_cancelled : {
        type : Boolean,
        default : false,
    },
    is_returned : {
        type : Boolean,
        default : false,
    },
    order_received : {
        type : Boolean,
        default : false,
    },
    complaint : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "complaint",
    }],
});

module.exports = mongoose.model("order" , orderSchema);