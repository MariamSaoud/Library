const mongoose=require("mongoose");
const userSchema=new mongoose.Schema({
    userName:String,
    email:{
        type:String,
        unique:true,
    },
    password:String,
    phoneNumber:Number,
    role:String,
})
module.exports=mongoose.model("users",userSchema)