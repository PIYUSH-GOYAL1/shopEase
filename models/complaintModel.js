const {default : mongoose} = require("mongoose");

const complaintSchema = mongoose.Schema({
    complaint_statement : {
        type : String,
    },
    complaint_date : {
        type : Date,
        default : Date.now
    },
    complaint_status : {
        type : String,
        default : "pending",
    },
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
    },
    order_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "owner",
    },
    owner_id : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
    }],
});

module.exports = mongoose.model("complaint" , complaintSchema);