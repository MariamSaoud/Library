const express=require('express');
const User=require('../models/user');
const Token=require('../models/token');
const category=require('../models/category');
const author=require('../models/author');
const book=require('../models/book');
const order=require('../models/order');
const orderDetails=require('../models/orderDetails');
const favorite=require('../models/favorite');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const joi=require('joi');
const multer = require('multer');
const SECRET_KEY="NOTESAPI";
exports.SignUp=async(req,res,next)=>{
    try{
        const SignUpSchema=joi.object({
            userName:joi.string().required(),
            email:joi.string().email().required(),
            phoneNumber:joi.string().required(),
            password:joi.string().min(4).max(12).required(),
            role:joi.string().required()
        })
        const result=await SignUpSchema.validate(req.body)
        if(result.error){
            return res.status(400).json({error:result.error.details[0].message})
        }
        const userName=req.body.userName;
        const email=req.body.email;
        const phoneNumber=req.body.phoneNumber;
        const password=req.body.password;
        const role=req.body.role;
        const existingUser=await User.findOne({$or:[{userName:userName},{email:email}]})
        if(existingUser!==null){
            return res.status(400).json({message:'This UserName Used Previously You Can Change It'})
        }
        const salt= await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt)
        const myUser=await User.create({userName:userName,email:email,phoneNumber:phoneNumber,password:hashedPassword,role:role})
        await myUser.save();
        return res.status(200).json({data:myUser})
    }catch(error){return res.status(500).json({error:error.message})}
}
exports.Login=async(req,res,next)=>{
    const loginSchema=joi.object({
        userName:joi.string().required(),
        email:joi.string().email().required(),
        password:joi.string().min(4).max(12).required()
    })
    const result=await loginSchema.validate(req.body)
        if(result.error){
            return res.status(400).json({error:result.error.details[0].message})
        }
        try{
        const userName=req.body.userName;
        const email=req.body.email;
        const password=req.body.password;
        const existingUser=await User.findOne({userName:userName,email:email})
        if(existingUser==null){
            return res.status(400).json({message:"You Don't Have An Account Try To Do One Then Login"})
        }
        if(existingUser.role==='admin'){
            return res.status(400).json({message:"You Don't Have The Permission To Login As A User"})
        }
        const matchPassword=await bcrypt.compare(password,existingUser.password)
        if(!matchPassword){
            return res.status(400).json({message:"Wrong Password,Try To Remember Your Right One"})
        }
        const token=await jwt.sign({email:existingUser.email,_id:existingUser._id},SECRET_KEY)
        await Token.create({token:token})
        return res.status(202).json({data:existingUser,token:token})}
        catch(error){
            return res.status(500).json({error:error.message})
        }
}
exports.Logout=async(req,res,next)=>{
    if(req.headers.authorization){
        const token=req.headers.authorization.split(' ')[1];
        if(!token){
            return res.status(400).json({message:"Authorization Failed!"})
        }
        const findLog=await Token.findOne({token:token})
        if(!findLog){
            return res.status(400).json({message:"Not Logged In!"})
        }
        await Token.deleteOne({token:token})
        return res.status(202).json({message:"Logged Out Successfully! GoodBye :)"})
    }
}

//Books
exports.askForaddingBook=async(req,res,next)=>{
    const bookSchema=joi.object({
        name:joi.string().required(),
        description:joi.required(),
        rate:joi.number().required(),
        fileUrl:joi.string().optional(),
        photoUrl:joi.string().optional(),
        canBuy:joi.boolean().optional(),
        price:joi.number().required(),
        quantity:joi.number().optional(),
        myauthor:joi.string().required(),
        mycategory:joi.string().required(),
        date:joi.date().optional(),
    })
    const result=bookSchema.validate(req.body)
    if(result.error){
        return res.status(400).json({error:result.error.details[0].message})
    }
    try{
    const date=req.body.date;
    const name=req.body.name;
    const desccription=req.body.desccription;
    const rate=req.body.rate;
    const quantity=req.body.quantity;
    const canBuy=req.body.canBuy;
    const price=req.body.price;
    const myauthor=req.body.myauthor;
    const mycategory=req.body.mycategory;
    let Id1;
    let Id2;
    const myBook=await book.findOne({name:name})
    if(myBook){
        return res.status(400).json({message:'The Book Existed Previously!'})
    }
    const myauthorID=await author.findOne({name:myauthor})
    if(!myauthorID){
        let a=await author.create({name:myauthor})
        Id1=await a._id;
    }
    else{
        Id1=await myauthorID._id;
    }
    const mycategoryID=await category.findOne({type:mycategory})
    if(!mycategoryID){
        let a=await category.create({type:mycategory})
        Id2=await a._id;
    }
    else{
        Id2=await mycategoryID._id;
    }
    let images=await req.files;
    let fileUrl;
    let photoUrl
    for(let i=0;i<2;i++){
        if(!images[i]){
            return res.status(422).json({message:"Attach File Is Not A Message!"})
        }
            if(i==0){
                photoUrl=await images[0].path;
                console.log(photoUrl)}
            if(i==1){
                fileUrl=await images[1].path;
                console.log(fileUrl)
            }
    }
    const mybook=await book.create({name:name,desccription:desccription,rate:rate,canBuy:canBuy,published:false,price:price,
        authorID:Id1,categoryID:Id2,fileUrl:fileUrl,photoUrl:photoUrl,quantity:quantity,date:date
    })
    return res.status(202).json({data:mybook})
    }
    catch(error){
        return res.status(500).json({error:error.message})
    }
}
exports.askforBuying=async(req,res,next)=>{
    try{
    let booleanBuy=true;
    let cannotBuy;
    const userId=req.id;
    const books=await JSON.parse(req.body.mybooks)
    for(let i=0;i<books.mybooks.length;i++){
        let c=await book.findOne({name:books.mybooks[i].name})
        if(c.canBuy===false)
        {   booleanBuy=false;
            cannotBuy=c.name;
            break;
        }
    }
    if(booleanBuy){
        var s;
        const o=await order.findOne({userId:userId,state:"waiting!"}) 
        if(!o){
            const ord=await order.create({userId:userId,state:"waiting!"})
            s=ord._id;
        }
        else{
            s=o._id;
        }
        let ids=[];let q=true;
        for(let i=0;i<books.mybooks.length;i++){
            let c=await book.findOne({name:books.mybooks[i].name})
            if(books.mybooks[i].count>c.quantity){
                ids.push(books.mybooks[i].name)
                q=false;
            }
        }
        if(q){
            for(let i=0;i<books.mybooks.length;i++){
                let c=await book.findOne({name:books.mybooks[i].name})
                await orderDetails.create({orderId:s,bookId:c._id,count:books.mybooks[i].count})
            }
            return res.status(200).json({message:"Order Waiting To Confirm!"})
        }
        else{
            return res.status(400).json({message:`The Quantity is less Than The Count You Want! ${ids}`})
        }
    }
    else{
        return res.status(400).json({message:`The Book ${cannotBuy} Is Not Allowed To Buy :(`})
    }}
    catch(error){
        return res.status(500).json({error:error.message})
    }
}
exports.addToFav=async(req,res,next)=>{
    try {
        const userId=req.id;
        const bookId=req.query;
        const b=await book.findOne({_id:bookId})
        if(!b){
            return res.status(400).json({message:"Book Not Found!"})
        }
        const f=await favorite.findOne({userId:userId,bookId:bookId})
        if(f){
            return res.status(200).json({message:"Added To Favorite Previously!"})
        }
        await favorite.create({userId:userId,bookId:bookId})
        return res.status(202).json({message:"Added To Favorite Successfully!"})
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}
exports.removeFromFav=async(req,res,next)=>{
    try {
        const userId=req.id;
        const bookId=req.query;
        const b=await book.findOne({_id:bookId})
        if(!b){
            return res.status(400).json({message:"Book Not Found!"})
        }
        const f=await favorite.findOne({userId:userId,bookId:bookId})
        if(!f){
            return res.status(200).json({message:"It Is Already Not Here!"})
        }
        await favorite.deleteOne({userId:userId,bookId:bookId})
        return res.status(202).json({message:"Deleted From Favorite Successfully!"})
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}
exports.cancelFromOrder=async(req,res,next)=>{
    try {
        const _id=req.query;
        const od=await orderDetails.findOne({_id:_id})
        if(!od){
            return res.status(400).json({message:"This Item Isn't Here!"})
        }
        const o=await order.findOne({_id:od.orderId})
        if(o.state==="Buy"){
            return res.status(400).json({message:"You Cannnot Cancel This Because This Item Is Bought!"})
        }
        await orderDetails.deleteOne({_id:_id})
        return res.status(200).json({message:"Deleted Successfully!"})
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}
exports.cancelOrder=async(req,res,next)=>{
    try {
        const id=req.query;
        const o=await order.findOne({_id:id})
        if(!o){
            return res.status(400).json({message:"Order Not Found!"})
        }
        if(o.state==="Buy"){
            return res.status(400).json({message:"You Cannnot Cancel This Because This Order Is Bought!"})
        }
        await orderDetails.deleteMany({orderId:o._id})
        await order.deleteOne({_id:id})
        return res.status(200).json({message:"The Order Deleted Successfully!"})
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}
exports.showBook=async(req,res,next)=>{
    try {
        const page=req.query.page||1;
        const limit=req.query.limit||2;
        const skip=(page-1)*limit;
        const b=await book.find({published:true}).populate('authorID').populate('categoryID').skip(skip).limit(limit);
        if(b.length==0){
            return res.status(400).json({message:"No Published Book Here!"})
        }
        const c=await book.countDocuments({published:true})
        return res.status(200).json({data:b,pagination:{
            page:+page,
            limit:+limit,
            totalpage:Math.ceil(c/limit)
        }})
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}
//try to refactory it
exports.showOrder=async(req,res,next)=>{
    try {
        let id=[];
        const userId=req.id;
        const o=await order.find({userId:userId})
        if(!o){
            return res.status(400).json({message:"You Didn't Buy Any Order Right Now"})
        }
        for(let i=0;i<o.length;i++)
        {   
        const od=await orderDetails.find({orderId:o[i]._id}).populate('orderId').populate('bookId')
        id.push(od)
        }
        return res.status(200).json({data:id})
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}
exports.showFav=async(req,res,next)=>{
    try {        
        const page=req.query.page||1;
        const limit=req.query.limit||2;
        const skip=(page-1)*limit;
        const id=req.id;
        const data=await favorite.find({userId:id}).populate('bookId').skip(skip).limit(limit);
        if(data.length==0){
            return res.status(400).json({message:"Empty Here!"})
        }
        const c=await  favorite.countDocuments({userId:id})
        return res.status(200).json({data:data,pagination:{
            page:+page,
            limit:+limit,
            totalpage:Math.ceil(c/limit)}})
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}
exports.search=async(req,res,next)=>{
    try {
        const value=req.body.value;
        const author1=await author.findOne({name:value})
        if(!author1){
            const category1=await category.findOne({type:value})
            if(!category1){
                return res.status(400).json({data:[]})
            }
            const mybookCategory=await book.find({categoryID:category1._id})
            return res.status(200).json({data:mybookCategory})
        }
        const mybookAuthor=await book.find({authorID:author1._id})
        return res.status(200).json({data:mybookAuthor})
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}