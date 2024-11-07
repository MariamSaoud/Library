const mongoose=require('mongoose');
const user=require('./user');
const book=require('./book');
const favoriteSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:user
    },
    bookId:{
        type:mongoose.Types.ObjectId,
        ref:book
    }
})
module.exports=mongoose.model('favorite',favoriteSchema)