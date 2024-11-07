const mongoose=require('mongoose');
const user=require('./user');
const orderSchema=new mongoose.Schema({
    state:{
        type:String,
        default:"waiting!"
    },
    userId:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:user
    }
})
module.exports=mongoose.model('order',orderSchema)