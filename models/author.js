const mongoose=require('mongoose');
const authSchema=new mongoose.Schema({
    name:String
})
module.exports=mongoose.model("author",authSchema)