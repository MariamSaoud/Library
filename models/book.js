const mongoose=require('mongoose');
const author = require('./author');
const category = require('./category');
const bookSchema=new mongoose.Schema({
    name:{
        type:String,
        unique:true,
    },
    desccription:String,
    rate:Number,
    quantity:
    {type:Number,
        default:1
    },
    fileUrl:String,
    canBuy:{
        type:Boolean,
        default:false},
    photoUrl:String,
    published:{
        type:Boolean,
        default:false},
    price:Number,
    authorID:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:author,
    },
    categoryID:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:category,
    },
    date:{
        type:Date,
        default:Date.now()
    }
})
module.exports=mongoose.model('Books',bookSchema);