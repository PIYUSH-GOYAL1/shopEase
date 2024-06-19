const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const {userRegistration} = require("../controllers/userCtrl");
const { isLoggedIn } = require("../middlewares/isLoggedIn");
const userModel = require("../models/userModel");
const ownerModel = require("../models/ownerModel");
const orderModel = require("../models/orderModel");
const complaintModel = require("../models/complaintModel");

const upload = require("../config/multerConfig");
const { generateToken } = require("../utils/generateToken");
const productModel = require("../models/productModel");
const reviewModel = require("../models/reviewModel");


router.post("/register" , userRegistration );

router.get("/changePassword" , isLoggedIn , (req,res)=>{
    error = req.flash("error");
    res.render("changePwdUser" , {error : error});
});

router.post("/updatePassword" , isLoggedIn , async (req,res)=>{
    // res.send("form is working");
    // console.log(req.user);
    let findUser = await userModel.findOne({_id : req.user._id});
    if (!findUser){
        req.flash("error" , "Something Went Wrong");
        res.redirect('/shop');
    }else{
        bcrypt.compare(req.body.oldpassword , findUser.password , (err,result)=>{
            if(err){
                res.send(err.message);
            }else{
                if (result){
                    if (req.body.newpassword === req.body.confirmpassword){
                        bcrypt.genSalt(10 , (err , salt)=>{
                            bcrypt.hash(req.body.newpassword , salt , async (err,hash)=>{
                                let updatedUser = await userModel.updateOne({_id : req.user._id} , {
                                    password : hash
                                } , {new : true});
                            })
                        });
                        req.flash("error" , "Password is Changed Successfully.");
                        res.redirect("/shop");
                    }else{
                        req.flash("error" , "Password is not Confirmed.");
                        res.redirect("/user/changePassword");
                    }
                }else{
                    req.flash("error" , "Old Password is not matched");
                    res.redirect("/shop");
            }
            }
        })
    }
});

router.get("/updateProfile" , isLoggedIn , (req,res)=>{
    let error = req.flash("error");
    res.render("updateUserProfile" , {user : req.user , error : error});
});

router.post("/updateProfile" , isLoggedIn , upload.single("profilepic") ,  async (req,res)=>{
    // res.send("form is working");
    let regEmailInOwner = await ownerModel.findOne({email : req.body.email});
    let regEmailInUser = await userModel.findOne({email : req.body.email});
    let regContactInOwner = await ownerModel.findOne({contact : req.body.contact});
    let regContactInUser = await userModel.findOne({contact : req.body.contact});
    // console.log("lets see" , req.user._id);
    let findUser = await userModel.findOne({_id : req.user._id});
    // console.log(findUser);
    if(!findUser){
        req.flash("error" , "Somrthing Went Wrong");
        res.redirect("/user/updateProfile");
    }else{
        if (regEmailInOwner || regEmailInUser || regContactInOwner || regContactInUser){
            req.flash("error" , "Email or Contact Number is already Registered");
            res.redirect("/user/updateProfile");
        }else{
            let updateUser = await userModel.updateOne({_id : req.user._id}, {
                email : req.body.email || req.user.email,
                contact : req.body.contact || req.user.contact,
                address : req.body.address,
                dob : req.body.dob,
                profilepic : req.file.buffer || req.user.buffer,
            } , {new : true});
            // console.log(updateUser);
            let newUser = await userModel.findOne({email : req.body.email});
            // console.log(newUser);
            let token = generateToken(newUser);
            // console.log(token);
            res.cookie("token" , token);
            req.user = newUser;
            req.flash("error" , "Profile Updated Successfully");
            res.redirect("/shop");
        }
    }

});

router.get("/addToCart/:id" , isLoggedIn , async (req,res)=>{
    let findUser = await userModel.findOne({_id : req.user._id});
    if (!findUser){
        req.flash("error" , "Something went Wrong");
        res.redirect("/shop");
    }else{
        // let findUser = await userModel.findOne({_id : req.user._id}).populate("cart");
        // console.log(findUser.cart.indexOf(req.params.id) === -1);
        // if (findUser.cart.indexOf(req.params.id) === -1){
        //     findUser.cart.push(req.params.id);
        //     await findUser.save();
        //     req.flash("error" , "Product Added To cart Successfully.")
        //     // res.redirect("/shop");
        // }else{
        //     req.flash("error" , "Product is Already in the cart");
        //     // res.redirect("/shop");
        // }
        // res.redirect("/shop");
        // findUser.cart.push(req.params.id);
        // await findUser.save();
        // req.flash("error" , "Product Added To cart Successfully.")
        // res.redirect("/shop");
        let findUser = await userModel.findOne({ _id: req.user._id }).populate("cart");

// Check if the product is already in the cart
        let productExists = findUser.cart.some(product => product._id.toString() === req.params.id);

        if (!productExists) {
    // Add the product to the cart
            findUser.cart.push(req.params.id);
            await findUser.save();
            req.flash("error", "Product added to cart successfully.");
        } else {
    // Product is already in the cart
            req.flash("error", "Product is already in the cart.");
}

// Redirect to the shop page
        res.redirect("/shop");
            }
        });

router.get("/cart" , isLoggedIn , async (req,res)=>{
    let user = await userModel.findOne({_id : req.user._id}).populate("cart");
    error = req.flash("error")
    res.render("cartPage" , {error : error , user : user});
});

router.get("/cart/remove/:id" , isLoggedIn , async (req,res)=>{
    let findUser = await userModel.findOne({_id : req.user._id});
    if (!findUser) {
        req.flash("error" , "Something Went Wrong");
        res.redirect("/shop");
    }else{
        updatedCartUser = await userModel.updateOne({_id : req.user._id} , {
            $pull: { cart: req.params.id }
        })
        .then(result =>{
            if (result.nModified > 0) {
                req.flash("error" , "Something Went Wrong.");
                res.redirect("/user/cart");
              } else {
                req.flash("error" , "Product Removed from cart Successfully");
                res.redirect("/user/cart");
              }
        })
    }
    
});

router.get("/plus/:id" , isLoggedIn , async (req,res)=>{
    findProduct = await productModel.findOne(req.params._id);
    quantity = findProduct.quantity_available;
    if (quantity < 5){
        // user cannot add more products
        // add same product id in cart column of user document
        // render it to the same cart page
        req.flash("error" , "You cannot add more products due to limited supply.");
        res.redirect("/user/cart");
    }else{
        findUser = await userModel.findOne({_id : req.user._id}).populate("cart");
        let productCount = findUser.cart.filter(product => product._id.toString() === req.params.id).length;
        // console.log(productCount);
        // user can add max 5 products
        if(productCount < 5){
            // allow him to add more product
            findUser.cart.push(req.params.id);
            await findUser.save();
            // req.flash("success", "Product added to cart successfully.");
            res.redirect("/user/cart");
        }else{
            req.flash("error" , "You cannot add more than 5 products.");
            res.redirect("/user/cart");
        }
    }
});

router.get("/minus/:id" , isLoggedIn , (req,res)=>{
    //
});

router.get("/cart/checkout" , isLoggedIn , async (req,res)=>{
    // console.log(req.user.cart);
    findUser = await userModel.findOne({_id : req.user._id}).populate("cart");
    // console.log(findUser.cart.product_name);
    res.render("checkout" , {user : findUser});
});

router.get("/cart/order" , isLoggedIn , async (req,res)=>{
    const findUser = await userModel.findOne({_id : req.user._id}).populate("cart");
    let amount = 0
    findUser.cart.forEach(function(product){
        // console.log(product.selling_price);
        amount = amount + product.selling_price
    });
    // console.log(amount);

    // create order in order table 
    const newOrder = await orderModel.create({
        total_amount : amount,
        shipping_address : findUser.address,
        purchased_by : findUser._id,
    });
    findUser.cart.forEach(async function(product){
        newOrder.product_list.push(product._id);
        
    });
    await newOrder.save();
    findUser.cart.forEach(async function(product){
        newOrder.order_manager.push(product.created_by);
    });
    await newOrder.save();
    // update user document having order and cart attribute
    findUser.order.push(newOrder._id);
    await findUser.save();

    await findUser.updateOne({ $set: { cart: [] } }); // check it
    // purchased_by and order_id in productModel addition
    findUser.cart.forEach(async function(product){
        let newProduct = await productModel.findOne({_id : product._id});
        newProduct.purchased_by.push(findUser._id);
        newProduct.order.push(newOrder._id);
        await newProduct.save();
    });
    // update quantity of product in product model
    findUser.cart.forEach(async function(product){
        const newProductQuant = await productModel.findOne({_id : product._id});
        const new_quantity = newProductQuant.quantity_available - 1
        let newProduct = await productModel.findOneAndUpdate({_id : product._id} , {quantity_available : new_quantity});
    })
    // order and user in ownerModel
    findUser.cart.forEach(async function(product){
        let newOwner = await ownerModel.findOne({_id : product.created_by});
        newOwner.user.push(findUser._id);
        newOwner.order.push(newOrder._id);
        await newOwner.save();
    });

    req.flash("error" , "Order Placed Successfully");
    res.redirect("/shop");
    
});

router.get("/order" , isLoggedIn , async (req,res)=>{
    // console.log(req.user._id);
    // let review = await reviewModel.find({user_id : req.user._id});
    let allOrder = await orderModel.find({purchased_by : req.user._id}).populate("product_list");
    // const currentOrder = allOrder.find({status : "processing"});
    // allOrder.forEach(async function(order){
    //     nextOrder = await order.find({status : "processing"});
    //     nextOrder.forEach(function(orderOne){

    //         console.log(orderOne);
    //     })
    // })
    // const currentHour = new Date().getHours();
    // const orderHour = new Date(order.order_date).getHours();
    // const hourDifference = currentHour - orderHour;
    past_order = []
    current_order = []
    allOrder.forEach(function(order){
        if ((order.status === "processing" || order.status === "dispatched") && (order.is_cancelled == false) && (order.is_returned == false)){
            current_order.push(order);
        }else if(order.status === "delivered" || order.is_returned == true || order.is_cancelled == true){
            past_order.push(order);
        }
    })
    // console.log("Current order" , current_order);
    // console.log("past orer" , past_order);
    let error = req.flash("error");
    res.render("orderPage" , {error : error , user : req.user ,past_order :  past_order , current_order : current_order});
});

router.get("/order/cancel/:id" , isLoggedIn , async (req,res)=>{
    const order = await orderModel.findOne({_id : req.params.id});
    newOrder = await orderModel.updateOne({_id : req.params.id} , {
        is_cancelled : true,
    });
    req.flash("error" , "Cancellation request is accepted.");
    res.redirect("/user/order");
});

router.get("/order/:id" , isLoggedIn , async (req,res)=>{
    let findOrder = await orderModel.findOne({_id : req.params.id});
    if (findOrder.is_returned === true){
        req.flash("error" , "You have already returned this order");
    }else{
        let updateOrder = await findOrder.updateOne({is_returned : true});
        req.flash("error" , "Return Request Is Accepted");

    }
    res.redirect("/user/order");
});

router.get("/order/review/:id" , isLoggedIn , async (req,res)=>{
    let error = req.flash("error");
    let findProduct = await productModel.findOne({_id : req.params.id});
    res.render("review" , {error : error , product : findProduct});
});

router.post("/order/review/:id" , isLoggedIn , async (req,res)=>{
    let findProduct = await productModel.findOne({_id : req.params.id});
    let findUser = await userModel.findOne({_id : req.user._id});
    let findOwner = await ownerModel.findOne({_id : findProduct.created_by})
    let review = await reviewModel.create({
        review_statement : req.body.review,
        user_id : req.user._id,
        product_id : req.params.id,
    });
    findProduct.review.push(review._id)
    findUser.review.push(review._id)
    findOwner.review.push(review._id)
    await findProduct.save()
    await findUser.save()
    await findOwner.save()

    req.flash("error" , "Review Submitted Successfully");
    res.redirect("/user/order");
});

router.get("/order/complaint/:id" , isLoggedIn , async (req,res)=>{
    let findOrder = await orderModel.findOne({_id : req.params.id}).populate("product_list");
    res.render("complaint" , {order : findOrder});
});

router.post("/order/complaint/:id" , isLoggedIn , async (req,res)=>{
    let findOrder = await orderModel.findOne({_id : req.params.id}).populate("product_list");
    let newComplaint = await complaintModel.create({
        complaint_statement : req.body.complaint,
        user_id : req.user._id,
        order_id : req.params.id,
    });

    // let findOwners = await orderModel.find({_id : req.params.id}).populate("order_manager");
    // console.log(findOwners.order_manager);
    // findOwners.order_manager.forEach(async function(owner){
    //     newComplaint.owner_id.push(owner._id);
    //     await newComplaint.save();
    // });

    // let compOwners = ownerModel.findOne({isSubOwner : false});
    // let findUser = userModel.findOne({_id : req.user._id});

    
    // findOrder.complaint.push(newComplaint._id);
    // compOwners.complaint.push(newComplaint._id);
    // findUser.complaint.push(newComplaint._id);

    // await findUser.save();
    // await findOrder.save();
    // await compOwners.save();

    req.flash("error" , "Complaint registered Successfully");
    res.redirect("/user/order");
})

module.exports = router;