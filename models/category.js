const mongoose=require('mongoose');
const categorySchema=new mongoose.Schema({
    type:String
})
module.exports=mongoose.model("category",categorySchema)