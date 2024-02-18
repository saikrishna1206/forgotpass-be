const express = require("express");
const app = express();
const mongoose= require('mongoose');
app.use(express.json());
const cors=require("cors");
app.use(cors());
const bcrypt= require("bcryptjs" );
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));


const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");

const JWT_SECRET = 
    "1q2w3e4r5t6y7u8i9o0p";

const mongoUrl = "mongodb+srv://saikrishna90:saikrishna90@cluster0.tzgs5do.mongodb.net/?retryWrites=true&w=majority"

mongoose 
.connect(mongoUrl, {
    useNewUrlParser: true,
    
    
    })
    .then(()=>{
        console.log("Connected to MongoDB");
})
    .catch((err)=>{ console.error("Error connecting to MongoDB", err);});
    
    
    require("./userDetails")

    const User = mongoose.model("Userinfo");
    app.post("/register", async(req,res)=>{
         const {fname,lname,email,password} =req.body;

         const encryptedPassword = await bcrypt.hash(password, 10);
         try {
            const oldUser = await User.findOne({ email });

            if (oldUser){
            return res.json({error:"Email already in use."});
            }
            await User.create({
                fname,
                lname,
                email,
                password: encryptedPassword,
            });
            res.send({ status: "ok"})
          } catch (error) {
            res.send({ status: "error" });
    }
});    

app.post("/login-user", async (req,res)=>{
    const {email, password}= req.body;

    const user = await User.findOne({ email});
    if(!user) {
        return res.json({error:"user not found."});
    }
    if (await bcrypt.compare(password, user.password)){
        const token = jwt.sign({ email: user.email }, JWT_SECRET, {
            expiresIn: 10,
        });

        if(res.status(201)){
            return res.json({status: "ok", data: token });
        }else{
            return res.json({ error: "error"});
        }
    }
    res.json({ status: "error", error: 'Invalid Password' });
});

app.post("/userData",async (req,res)=> {
    const {token} = req.body;
    try {
        const user = jwt.verify(token,JWT_SECRET, (err,res)=> {
           if(err) {
            return "token expired";
           } 
           return res;
        });
        console.log(user);

        if(user == "token expired") {
            return res.send({ status:"error", data: "token expired" });
        }


        const useremail = user.email;
        User.findOne({ email: useremail })
        .then((data) => {
            res.send({status:"ok", data: data});
        })
        .catch ((error) =>{
            res.send({ status: "error", data: error});
        });
    }
    catch (error) {}

});


app.listen(5000,()=> {
    console.log(`Server is running on port 5000`);
});
app.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
      const oldUser = await User.findOne({ email });
      if (!oldUser) {
        return res.json({ status: "User Not Exists!!" });
      }
      const secret = JWT_SECRET + oldUser.password;
      const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
        expiresIn: "5m",
    });
    const link = `http://localhost:5000/reset-password/${oldUser._id}/${token}`;
    var transporter = nodemailer.createTransport({
        service: "gmail",
         // Set to true if your server uses SSL/TLS
        auth: {
            user: "saikrishnavenkatesan90@gmail.com",
            pass: "icno xisb erol doik"
    },
      });
      
      var mailOptions = {
        from: 'youremail@gmail.com',
        to: "saikrishnafi20@gmail.com",
        subject: "Password Reset",
        text:link,
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    console.log(link);
    } catch (error) {}
});

app.get("/reset-password/:id/:token", async (req, res) => {
    const { id, token } = req.params;
    console.log(req.params);
    const oldUser = await User.findOne({ _id: id });
    if (!oldUser) {
        return res.json({ status: "User Not Exists!!" });
    }
    const secret = JWT_SECRET + oldUser.password;
    try {
        const verify = jwt.verify(token, secret);
        res.render("index", {email:verify.email, status:"Not verified"})
    } catch (error) {
        console.log(error);
        res.send("not verified");   
    }
});

app.post("/reset-password/:id/:token", async (req, res) => {
    const { id, token } = req.params;
    const{password}=req.body;
    const oldUser = await User.findOne({ _id: id });
    if (!oldUser) {
        return res.json({ status: "User Not Exists!!" });
    }
    const secret = JWT_SECRET + oldUser.password;
    try {
        const verify = jwt.verify(token, secret);
        const encryptedPassword = await bcrypt.hash(password, 10);
        await User.updateOne({ 
            _id: id 
        }, 
        {
            $set:{ 
                password: encryptedPassword, 
            },
         }
    );
        
        res.render("index", {email:verify.email, status: "verified"});
    } catch (error) {
        console.log(error); 
        res.json({status: "Something Went Wrong"});
          
    }
});