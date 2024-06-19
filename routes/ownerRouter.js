const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const upload = require("../config/multerConfig");

const {createOwner} = require("../controllers/ownerCtrl");
const { isAdmin } = require("../middlewares/isAdmin");
const { isLoggedIn } = require("../middlewares/isLoggedIn");

const ownerModel = require("../models/ownerModel");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");

const { generateToken } = require("../utils/generateToken");
const orderModel = require("../models/orderModel");
const complaintModel = require("../models/complaintModel");

const router = express.Router();



// This route will only work when main Owner has to be created
// router.get("/createOwner" , createOwner);


router.get("/changePwd" ,isAdmin , isLoggedIn ,  (req,res)=>{
    res.render("changePwd");
})
router.post("/changePwd" ,isAdmin , isLoggedIn, async (req,res)=>{
    let {email , newpassword , oldpassword} = req.body;
    let decoded = jwt.verify(req.cookies.token , process.env.SECRET_KEY);
    if (decoded.email === email){
        const user = await ownerModel.findOne({email});
        bcrypt.compare(oldpassword , user.password , (err,result)=>{
            if (err){res.send(err.message)}
            else {
                if (result){
                    bcrypt.genSalt(10 , (err,salt)=>{
                        bcrypt.hash(newpassword , salt , async (err,hash)=>{
                            if(err) res.send(err.message);
                            else{
                                await ownerModel.updateOne({email} , {password : hash});
                                req.flash("error" , "Password Changed successfully.");
                                res.redirect("/admin");
                            }
                            // user.password = hash;
                            // await user.save();
                            // let user = await ownerModel.findOneAndUpdate({email} , {password : hash});
                            // req.flash("error" , "Password Changed successfully.");
                            // res.redirect("/admin");
                        })
                    })
                }
                else{
                    req.flash("error" , "Old Password is Incorrect");
                    res.redirect("/admin");
                }
            }
        })
        
    }else{
        req.flash("error" , "User not Authenticated.");
        res.redirect("/admin");
    }
});

router.get("/updateProfile" , isAdmin , isLoggedIn , (req,res)=>{
    res.render("updateProfile" , {user : req.user});
});

router.post("/updateProfile" , isAdmin , isLoggedIn ,upload.single("profilepic") ,  async (req,res)=>{
    let {email , contact , address , dob} = req.body;
    // console.log(email);
    // res.send();
    // let profilepic = req.file;
    // find the user
    let decoded = jwt.verify(req.cookies.token , process.env.SECRET_KEY)
    // console.log(decoded.email);
    let owner = await ownerModel.findOne({email : decoded.email});
    // console.log(owner.email);
    if(!owner){
        req.flash("error" , "Something Went Wrong 01");
        res.redirect("/admin");
    }else{
        dupEmailinOwnerModel = await ownerModel.findOne({email});
        dupEmailinUserModel = await userModel.findOne({email});
        dupContactinOwnerModel = await ownerModel.findOne({contact});
        dupContactinUserModel = await userModel.findOne({contact});

        // console.log(dupEmailinOwnerModel.email);
        // console.log(dupEmailinUserModel.email);
        // console.log(dupContactinOwnerModel.contact);
        // console.log(dupContactinUserModel.contact);


        if (dupEmailinOwnerModel || dupEmailinUserModel || dupContactinOwnerModel || dupContactinUserModel){
            req.flash("error" , "Email or Contact already exists");
            res.redirect("/admin");
        }else{
            let updatedOwner = await ownerModel.updateOne({email : owner.email} , {email , contact , address , dob , profilepic : req.file.buffer});
            let findOwner = await ownerModel.findOne({email});
            let token = generateToken(findOwner);
            
            res.cookie("token" , token);
            req.flash("error" , "Profile Updated Successfully");
            req.user = findOwner;
            console.log("hello" , req.user.email);
            res.redirect("/admin");
        }
    }
    // res.send("yes it is working");
});

router.get("/createSubowner" , isAdmin , isLoggedIn , (req,res)=>{
    error = req.flash("error");
    res.render("createSubowner" , {error : error});
});

router.post("/createSubowner" , isAdmin , isLoggedIn , async (req , res)=>{
    let {fullname , email , contact , password , confirm_password} = req.body;
    const regEmailInOwner = await ownerModel.findOne({email});
    const regEmailInUser = await userModel.findOne({email});
    const regContactInOwner = await ownerModel.findOne({contact});
    const regContactInUser = await userModel.findOne({contact});

    if (regEmailInOwner || regEmailInUser || regContactInOwner || regContactInUser){
        req.flash("error" , "Email or contact number is already registered");
        res.redirect("/admin");
    }else{
        if (password === confirm_password){
            // let newOwner = await ownerModel.create({fullname , email , contact})
            bcrypt.genSalt(10 , (err,salt)=>{
                bcrypt.hash(password , salt , async (err,hash)=>{
                    if(err) res.send(err.message);
                    else{
                        let newSubOwner = await ownerModel.create({fullname , email , contact , password : hash});
                        req.flash("error" , "Subowner Created Successfully");
                        res.redirect("/admin");
                    }
                })
            })
        }else{
            req.flash("error" , "Password Do Not match");
            res.redirect("/admin");
        }
    }


});

router.get("/manageSubOwner" , isAdmin , isLoggedIn , async (req,res)=>{
    let error = req.flash("error");
    let owners = await ownerModel.find({isSubOwner : true });
    console.log(owners);
    res.render("manageSubOwner" , {user : owners , error : error} );
});

router.get("/manageSubOwner/delete/:id", isAdmin , isLoggedIn , async (req,res)=>{
    // let subowner = await ownerModel.findOneAndDelete({_id : req.params.id}, (err,result)=>{
    //     if(err){res.send(err.message)}
    //     else{
    //         if (result){
    //             req.flash("error" , "Employess Deleted Successfully.")
    //             res.redirect("/manageSubOwner");
    //         }else{
    //             req.flash("error" , "Error Occured while Deleting User.");
    //             res.redirect("/manageSubOwner");
    //         }
    //     }
    // })

    let subowner = await ownerModel.findOneAndDelete({_id : req.params.id})
    if(subowner){
        req.flash("error" , "Employee Deleted Successfully");
        res.redirect("/owner/manageSubOwner");
    }else{
        req.flash("error" , "Error Occured While Deleting User");
        res.redirect("/owner/manageSubOwner");
    }
});

router.get("/createProduct" , isAdmin , isLoggedIn , (req,res)=>{
    error = req.flash("error");
    res.render("createProduct" , {error : error});
});

router.post("/createProduct" , isAdmin , isLoggedIn ,upload.single("product_image"), async (req,res)=>{
    let existingProduct = await productModel.findOne({product_name : req.body.product_name});
    if (existingProduct) {
        req.flash("error" , "Product Already Exists");
        res.redirect("/owner/createProduct");
    }else{
        let newProduct = await productModel.create({
            product_name : req.body.product_name ,
            category : req.body.category,
            price : req.body.price ,
            selling_price : (req.body.price - ((req.body.price*req.body.discount)/100)),
            discount : req.body.discount,
            quantity_available : req.body.quantity_available,
            description : req.body.description,
            product_image : req.file.buffer,
            created_by : req.user._id,
        });
        let findMainOwner = await ownerModel.findOne({isSubOwner : false});
        let findOwner = await ownerModel.findOne({_id : req.user._id});
        console.log(findOwner._id);
        console.log(findMainOwner._id);
        console.log(findMainOwner._id !== findOwner._id)
        if (findMainOwner._id !== findOwner._id){
            findMainOwner.product.push(newProduct._id);
            await findMainOwner.save();
            findOwner.product.push(newProduct._id);
            await findOwner.save();
        }
        else{
            // findOwner.product.push(newProduct._id);
            // await findOwner.save();
            findMainOwner.product.push(newProduct._id);
            await findMainOwner.save();
        }

        // findOwner.product.push(newProduct._id);
        // findMainOwner.product.push(newProduct._id);
        // await findOwner.save();
        // await findMainOwner.save();
        req.flash("error" , "Product Created Successfully");
        res.redirect("/owner/createProduct");
    }
});

router.get("/manageProduct" , isAdmin , isLoggedIn , async (req,res)=>{
    error = req.flash("error");
    adminPower = req.user.isSubOwner
    if (!adminPower){
        products = await productModel.find();
    }else{
        products = await productModel.find({created_by : req.user._id});
    }
    res.render("manageProduct" , {product : products , error : error});
});

router.get("/manageProduct/:id" , isAdmin , isLoggedIn , async (req,res)=>{
    // res.send("it is working");
    product = await productModel.findOne({_id : req.params.id});
    // console.log(product);
    res.render("updateProduct" , {product});
});

router.post("/manageProduct/update" , isAdmin , isLoggedIn , upload.single("product_image"), async (req,res)=>{
    // product = await productModel.findOne({_id : req.params.id});
    // res.send("update ho gya.");
    // console.log(req.body);
    let findProduct = await productModel.findOne({_id : req.body.id});
    if (!findProduct) {
        req.flash("error" , "Error Happened while Updatig");
        res.redirect(`/owner/manageProduct`)
    }else{
        let updatedProduct = await productModel.updateOne({_id : req.body.id} , {
            product_name : req.body.product_name,
            category : req.body.category,
            price : req.body.price ,
            selling_price : (req.body.price - ((req.body.price*req.body.discount)/100)),
            discount : req.body.discount,
            quantity_available : req.body.quantity_available,
            description : req.body.description,
            product_image : req.file.buffer
        } , {new : true});
        req.flash("error" , "Product Updated Successfully.");
        res.redirect(`/owner/manageProduct`);
    }
});

router.get("/deleteProduct/:id" , isAdmin , isLoggedIn , async (req,res)=>{
    let findProduct = await productModel.findOne({_id : req.params.id});
    if (!findProduct){
        req.flash("Error" , "Something Went Wrong");
        res.redirect("/owner/manageProduct");
    }else{
        let deletedProduct = await productModel.deleteOne({_id : req.params.id});
        let findMainOwner = await ownerModel.findOne({isSubOwner : false});
        let findOwner = await ownerModel.findOne({_id : req.user._id});
        if (findMainOwner == findOwner){
            let updateMainOwner = await ownerModel.updateOne({_id: findMainOwner._id},{
                $pull: { product: req.params.id }
            });
        }else{
            let updateMainOwner = await ownerModel.updateOne({_id: findMainOwner._id},{
                $pull: { product: req.params.id }
            });
            let updateOwner = await ownerModel.updateOne({_id : findOwner._id},{
                $pull: { product: req.params.id }
            });
        }
        // let updateMainOwner = await ownerModel.updateOne({_id: findMainOwner._id},{
        //     $pull: { product: req.params.id }
        // });
        // let updateOwner = await ownerModel.updateOne({_id : req.params._id},{
        //     $pull: { product: req.params.id }
        // });
        req.flash("error" , "Product Deleted Successfully");
        res.redirect("/owner/manageProduct");
    }
});

router.get("/retrieve_order/:id" , isAdmin , isLoggedIn , async (req,res)=>{
    findOrder = await orderModel.findOne({_id : req.params.id});
    await findOrder.updateOne({order_received : true});
    req.flash("error" , "Order Is Retrieved.");
    res.redirect("/admin");
});

router.get("/manage_order/:id" , isAdmin , isLoggedIn , async (req,res)=>{
    let error = req.flash("error");
    let findOrder = await orderModel.findOne({_id : req.params.id}).populate("product_list");
    let findUser = await userModel.findOne({_id : findOrder.purchased_by});
    res.render("manage_order" , {error : error , order : findOrder , user : findUser});
});

router.post("/manage_order/:id" , isAdmin , isLoggedIn , async (req,res)=>{
    let findOrder = await orderModel.findOne({_id : req.params.id});
    let updateOrder = await findOrder.updateOne({status : req.body.order_status});
    req.flash("error" , "Status Updated successfully.")
    res.redirect("/admin");
});

router.get("/past_orders" , isAdmin , isLoggedIn , async (req,res)=>{
    let success_orders = await orderModel.find({status : "delivered" ,is_cancelled : false , is_returned : false });
    let cancelled_orders = await orderModel.find({is_cancelled : true});
    let returned_orders = await orderModel.find({is_returned : true});
    res.render("past_orders" , {success_orders , cancelled_orders , returned_orders});
});

router.get("/resolve_complaint/:id" , isAdmin , isLoggedIn , async (req,res)=>{
    findComp = await complaintModel.findOneAndUpdate({_id : req.params.id},{
        complaint_status : "completed",
    });
    req.flash("error" , "Complaint resolved.");
    res.redirect("/admin")
});

router.get("/view_complaints" , isAdmin , isLoggedIn , async (req,res)=>{
    let pendingComp = await complaintModel.find({complaint_status : "pending"});
    let successComp = await complaintModel.find({complaint_status : "completed"}).populate("user_id");
    res.render("complaints" , {pendingComp , successComp})
})

module.exports = router;