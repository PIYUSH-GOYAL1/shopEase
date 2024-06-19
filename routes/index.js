const express = require("express");
const router = express.Router();
const flash = require("connect-flash");
router.use(flash());

const {loginCtrl} = require("../controllers/loginCtrl");
const {isLoggedIn} = require("../middlewares/isLoggedIn");
const { isAdmin } = require("../middlewares/isAdmin");

const productModel = require("../models/productModel");
const ownerModel = require("../models/ownerModel");
const orderModel = require("../models/orderModel");
const complaintModel = require("../models/complaintModel");

router.get("/" , (req,res)=>{
    let error = req.flash("error");
    console.log(error);
    res.render("home" , {error : error});
});

router.get("/shop" ,isLoggedIn ,  async (req,res)=>{
    let products = await productModel.find().populate("review");
    error = req.flash("error")
    res.render("shop" , {user : req.user , error : error , product : products});
});

router.get("/admin" ,  isAdmin , isLoggedIn,  async (req,res)=>{
    error = req.flash("error");
    console.log(req.user._id);
    let owner = await ownerModel.findOne({_id : req.user._id}).populate("order");
    console.log(owner.fullname);
    let cancelled_orders = [];
    let returned_orders = [];

    // CANCELLED ORDER QUERY LIST
    if (!owner.isSubOwner){
        owner.order.forEach(function(orderOne){
            if(orderOne.is_cancelled === true && orderOne.order_received === false){
                cancelled_orders.push(orderOne);
            }
        })
    }else{
        // main owner
        let orders = await orderModel.find({is_cancelled : true , order_received : false});
        cancelled_orders = orders
    }
    // RETURNED ORDERS QUERY LIST
    if (!owner.isSubOwner){
        owner.order.forEach(function(orderOne){
            if(orderOne.is_returned === true && orderOne.order_received === false){
                returned_orders.push(orderOne);
            }
        })
    }else{
        // main owner
        let orders = await orderModel.find({is_returned : true , order_received : false});
        returned_orders = orders
    }

    managed_orders = []
    if (!owner.isSubOwner){
        owner.order.forEach(function(order){
            if ((order.status == "processing" || order.status == "dispatched") && (order.is_cancelled ==false) && (order.is_returned == false)){
                managed_orders.push(order);
            }
        })
    }else{
        let orders = await orderModel.find({status : "processing" , is_cancelled : false , is_cancelled : false});
        let orders2 = await orderModel.find({status : "dispatched" , is_cancelled : false , is_cancelled : false});
        orders.forEach(function(order){
            managed_orders.push(order);
        });
        orders2.forEach(function(order){
            managed_orders.push(order);
        });
        

    };

    let pending_complaints = await complaintModel.find({complaint_status : "pending"}).populate(["user_id" , "order_id"]);
    res.render("admin" , {user : req.user , error : error , cancelled_orders : cancelled_orders , returned_orders : returned_orders , managed_orders : managed_orders ,pending_complaints });
});

router.post("/login" , loginCtrl);

router.post("/logout" , (req,res)=>{
    res.cookie("token" , "");
    req.flash("success" , "You Are successfully logout.");
    res.redirect("/");
});

module.exports = router;