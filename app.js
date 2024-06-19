const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const flash = require("connect-flash");

const db = require("./config/dbConnect");

require("dotenv").config();

const authRouter = require("./routes/index");
const ownerRouter = require("./routes/ownerRouter");
const userRouter = require("./routes/userRouter");

const app = express();

app.set("view engine" , "ejs");

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname , "public")));
app.use(cookieParser());
app.use(expressSession({
    resave : false,
    saveUninitialized : false,
    secret : process.env.SESSION_SECRET_KEY,
}))

app.use("/" , authRouter);
app.use("/owner" ,ownerRouter );
app.use("/user" , userRouter);

app.listen(process.env.PORT , ()=>{
    console.log(`App is running on Port ${process.env.PORT}`);
});