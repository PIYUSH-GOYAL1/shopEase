const {default : mongoose} = require("mongoose");


const reviewSchema = mongoose.Schema({
    review_statement : {
        type : String,
    },
    // rating : {
    //     type : Number,
    // },
    // order_id : {
    //     type : mongoose.Schema.Types.ObjectId,
    //     ref : 'order',
    // },
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
    },
    product_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "product",
    },
});

module.exports = mongoose.model("review" , reviewSchema);