const mongoose=require('mongoose');
const schema=new mongoose.Schema({
    username:{
        type: String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})
const userSchema=mongoose.model('emails',schema)
module.exports = userSchema