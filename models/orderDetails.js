const mongoose=require('mongoose');
const order=require('./order');
const book=require('./book');
const orderDetailsSchema=new mongoose.Schema({
    orderId:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:order
    },
    bookId:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:book
    },
    count:Number,
})
module.exports=mongoose.model('orderDetails',orderDetailsSchema)