const mongoose = require ("mongoose");

const UserDetailsSchema = new mongoose.Schema(
    {
    fname: String,
    lname: String,
    email: {type:String, unique:true},  //email should be unique for every user
    password: String,
    
    },
    {
    collection:"Userinfo",
    }
);

mongoose.model("Userinfo", UserDetailsSchema);
