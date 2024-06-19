const {default : mongoose} = require("mongoose");
// const config = require("config");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI)
.then(function(){
    console.log("DataBase Connected");
}).catch(function(err){
    console.log(err.message);
});

module.exports = mongoose.connection;
