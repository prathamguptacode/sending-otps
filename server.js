const express=require('express');
const app=express();

const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost/testdb').then(console.log('connected to db'))
const User=require('./schema.js');

app.use(express.json());

const bcrypt=require('bcrypt');

const otpGenerator=require('otp-generator')

const nodemailer=require('nodemailer')

require('dotenv').config()

const fs=require('fs');


app.get('/',(req,res)=>{
    console.log('hello world')
    res.send('hello world')
})

let userObj;
let checkOtp;
app.post('/signup',async (req,res)=>{
    try{
        const data=req.body;
        const pass=data.password;
        const hashedPassword=await bcrypt.hash(pass,10);
        userObj={username: data.username, email: data.email,password: hashedPassword};
        // const otp=otpGenerator.generate(6,{digits:true,upperCaseAlphabets:false,lowerCaseAlphabets:true,specialChars:true})
        const check=await User.findOne({username: data.username});
        if(check)return res.send('you already have a account')
        res.send('go to /verify to verify your email and enter your otp there')
        const otp=otpGenerator.generate(6,{digits:true,upperCaseAlphabets:false,lowerCaseAlphabets:false,specialChars:false})
        sendOtp(otp)
        checkOtp=otp
        
    } catch(e){
        res.send(e.message)
    }
})

function sendOtp(otppin){
    const transporter=nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user: 'prathamgupta.wk@gmail.com',
            pass: process.env.EMAILKEY
        }
    })
    const mailOption={
        from: 'prathamgupta.wk@gmail.com',
        to: userObj.email,
        subject: 'your otp from pratham',
        text: `your otp is ${otppin}`
    }
    transporter.sendMail(mailOption,(err,val)=>{
        if(err){
            console.log(err)
            return res.send(err)
        } 
        console.log(val)
    })
}

app.post('/verify',async (req,res)=>{
    const otp=req.body.otp;
    if(checkOtp == otp){
        const user = new User(userObj);
        await user.save();
        res.send('your account has been successly created')
    }
    else{
        res.send('invalid otp')
    }
})

let htmlData='';
fs.readFile('./mail.html',(err,data)=>{
    if(err) return console.log('cant read the file')
    htmlData=data
})
app.post('/email',(req,res)=>{
    console.log('user on it')
    const email=req.body.email;
    const message=req.body.message;
    let transporter=nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user: 'prathamgupta.wk@gmail.com',
            pass: process.env.EMAILKEY
        }
    });
    let mailOptions={
        from: 'prathamgupta.wk@gmail.com',
        to: email,
        subject: 'my email',
        text:  message,
        // html: htmlData
    }
    transporter.sendMail(mailOptions,function(error,info){
        console.log(info)
        if(error) return res.send(error)
        res.send('mail send successfully')
    })
})

app.get('/login',async (req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    const dbuser=await User.findOne({username: username});
    if(!dbuser) return res.send('user not found go to sign in')
    const check=await bcrypt.compare(password,dbuser.password);
    if(check){
        res.send(`hello there ${username}`)
    }
    else{
        res.send('invalid password')
    }
})


app.listen(3000)