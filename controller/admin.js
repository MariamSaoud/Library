const express=require('express');
const User=require('../models/user');
const Token=require('../models/token');
const category=require('../models/category');
const author=require('../models/author');
const book=require('../models/book');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const joi=require('joi');
const SECRET_KEY="NOTESAPI";
const path=require('path');
const { error } = require('console');
const fs=require('fs');
const order = require('../models/order');
const orderDetails = require('../models/orderDetails');
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
        if(existingUser.role==='user'){
            return res.status(400).json({message:"You Don't Have The Permission To Login As An Admin"})
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
//Category
exports.addCategory=async(req,res,next)=>{
    const ValidationSchema=joi.object({
        type:joi.string().required()
    })
    const result=ValidationSchema.validate(req.body);
    if(result.error){
        return res.status(400).json({error:result.error.details[0].message})
    }
    const type=req.body.type;
    const myCategory =await category.create({type:type})
    return res.status(202).json({data:myCategory}) 
}
exports.updateCategory=async(req,res,next)=>{
    const ValidationSchema=joi.object({
        type:joi.string().required()
    })
    const result=ValidationSchema.validate(req.body);
    if(result.error){
        return res.status(400).json({error:result.error.details[0].message})
    }
    try{
        const type=req.body.type;
        const _id=req.query._id;
        const categoryOne=await category.findOne({_id:_id})
        if(!categoryOne){
            return res.status(400).json({message:"Cannot Find This Element!"})
        }
        await category.updateOne({_id:_id},{type:type})
        return res.status(202).json({message:"Updated Successfully :)"}) 
    }catch(error){
        return res.status(500).json({error:error.message})
    }
}
exports.deleteCategory=async(req,res,next)=>{
    try{
        const _id=req.query._id;
        const categoryOne=await category.findOne({_id:_id})
        if(!categoryOne){
            return res.status(400).json({message:"Cannot Find This Element!"})
        }
        await category.deleteOne({_id:_id})
        return res.status(202).json({message:"deleted Successfully :("}) 
    }catch(error){
        return res.status(500).json({error:error.message})
    }
}
//Author
exports.addAuthor=async(req,res,next)=>{
    const ValidationSchema=joi.object({
        name:joi.string().required()
    })
    const result=ValidationSchema.validate(req.body);
    if(result.error){
        return res.status(400).json({error:result.error.details[0].message})
    }
    const name=req.body.name;
    const myauthor =await author.create({name:name})
    return res.status(202).json({data:myauthor}) 
}
exports.updateAuthor=async (req,res,next) => {
    const ValidationSchema=joi.object({
        name:joi.string().required()
    })
    const result=ValidationSchema.validate(req.body);
    if(result.error){
        return res.status(400).json({error:result.error.details[0].message})
    }
    const name=req.body.name;
    const _id=req.query._id;
    const myauthor =await author.findOne({_id:_id})
    if(!myauthor){
        return res.status(400).json({message:"Cannot Find This Element!"})
    }
    await author.updateOne({_id:_id},{name:name})
    return res.status(202).json({message:"Updated Successfully!"}) 
}
exports.deleteAuthor=async (req,res,next) => {
    const _id=req.query._id;
    const myauthor =await author.findOne({_id:_id})
    if(!myauthor){
        return res.status(400).json({message:"Cannot Find This Element!"})
    }
    await author.deleteOne({_id:_id})
    return res.status(202).json({message:"deleted Successfully!"}) 
}
//Books
exports.addBook=async(req,res,next)=>{
    const bookSchema=joi.object({
        name:joi.string().required(),
        description:joi.required(),
        rate:joi.number().required(),
        fileUrl:joi.string().optional(),
        photoUrl:joi.string().required(),
        canBuy:joi.boolean().optional(),
        photoUrl:joi.string().optional(),
        published:joi.boolean().optional(),
        price:joi.number().required(),
        myauthor:joi.string().required(),
        mycategory:joi.string().required(),
        quantity:joi.number().optional(),
        date:joi.date().optional(),
    })
    const result=bookSchema.validate(req.body)
    if(result.error){
        return res.status(400).json({error:result.error.details[0].message})
    }
    try{
    const quantity=req.body.quantity;
    const date=req.body.date;
    const name=req.body.name;
    const desccription=req.body.desccription;
    const rate=req.body.rate;
    const canBuy=req.body.canBuy;
    const published=req.body.published;
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
        let a=await category.create({name:mycategory})
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
    const mybook=await book.create({name:name,desccription:desccription,rate:rate,canBuy:canBuy,published:published,price:price,
        authorID:Id1,categoryID:Id2,fileUrl:fileUrl,photoUrl:photoUrl,quantity:quantity,date:date
    })
    return res.status(202).json({data:mybook})
    }
    catch(error){
        return res.status(500).json({error:error.message})
    }
}
exports.showBooks=async(req,res,next)=>{
    try{
        const page=req.query.page||1;
        const limit=req.query.limit||2;
        const skip=(page-1)*limit;
        const myBooks=await book.find().populate("authorID").populate("categoryID").skip(skip).limit(limit);
        if(myBooks.length==0){
            return res.status(400).json({message:"No Book Here!"})
        }
        const c=await book.countDocuments()
        return res.status(200).json({data:myBooks,pagination:{
            page:+page,
            limit:+limit,
            totalpage:Math.ceil(c/limit)
        }})
    }catch(error){
        return res.status(500).json({error:error.message})
    }
}
exports.ConfirmaddedBook=async(req,res,next)=>{
    try{
        const name=req.body.name;
        const b=await book.findOne({$and:[{name:name},{published:false}]})
        if(!b){
            return res.status(400).json({message:"The Book Confirmed Previously!"})
        }
        else{
            await book.updateOne({name:name,published:false},{published:true})
            return res.status(202).json({message:"Confirmed Successfully!"})
        }
    }catch(error){
        return res.status(500).json({error:error.message})
    }
}
exports.updateBookDetails=async(req,res,next)=>{
    const bookSchema=joi.object({
        name:joi.string().optional(),
        description:joi.optional(),
        rate:joi.number().optional(),
        canBuy:joi.boolean().optional(),
        published:joi.boolean().optional(),
        price:joi.number().optional(),
        myauthor:joi.string().optional(),
        mycategory:joi.string().optional(),
    })
    const result=bookSchema.validate(req.body)
    if(result.error){
        return res.status(400).json({error:result.error.details[0].message})
    }
    try{
    const _id=req.query._id;
    const name=req.body.name;
    const desccription=req.body.desccription;
    const rate=req.body.rate;
    const canBuy=req.body.canBuy;
    const published=req.body.published;
    const price=req.body.price;
    const myauthor=req.body.myauthor;
    const mycategory=req.body.mycategory;
    let Id1;
    let Id2;
    const myExistingBook=await book.findOne({_id:_id})
    if(!myExistingBook)
    {
        return res.status(400).json({message:'This Item Is Not In Our Library :('})
    }
    if(myauthor){
        const myauthorID=await author.findOne({name:myauthor})
        if(!myauthorID){
            let a=await author.create({name:myauthor})
            Id1=await a._id;
        }
        else{
            Id1=await myauthorID._id;
        }
    }
    if(mycategory){
        const mycategoryID=await category.findOne({type:mycategory})
        if(!mycategoryID){
            let a=await category.create({name:mycategory})
            Id2=await a._id;
        }
        else{
            Id2=await mycategoryID._id;
        }
    }
    await book.updateOne({_id:_id},{name:name,desccription:desccription,rate:rate,canBuy:canBuy
        ,published:published,price:price,authorID:Id1,categoryID:Id2})
    return res.status(202).json({message:'Update Details Successfully!'})
    }
    catch(error){
        return res.status(500).json({error:error.message})
    }
}
exports.updateBookFiles=async(req,res,next)=>{
    const bookSchema=joi.object({
        fileUrl:joi.string().optional(),
        photoUrl:joi.string().optional(),
    })
    const result=bookSchema.validate(req.body)
    if(result.error){
        return res.status(400).json({error:result.error.details[0].message});
    }
    try
    {const _id=req.query;
    const images=await req.files;
    const myExistingBook=await book.findOne({_id:_id})
    if(!myExistingBook)
    {
        return res.status(400).json({message:'This Item Is Not In Our Library :('})
    }
    let fileUrl;
    let photoUrl;
    for(let i=0;i<images.length;i++){
        if(!images[i]){
            return res.status(422).json({message:"Attach File Is Not A Message!"})
        }
            if(images[i].mimetype==='image/png'||images[i].mimetype==='image/jpg'||images[i].mimetype==='image/jpeg'){
                fs.unlinkSync(myExistingBook.photoUrl)
                photoUrl=await images[i].path;
                console.log(photoUrl)}
            if(images[i].mimetype==='application/pdf'){
                fs.unlinkSync(myExistingBook.fileUrl)
                fileUrl=await images[i].path;
                console.log(fileUrl)
            }
    }
    await book.updateOne({_id:_id},{fileUrl:fileUrl,photoUrl:photoUrl})
    return res.status(202).json({message:"Update Files Successfully!"})}
    catch(error){
        return res.status(500).json({error:error.message})
    }
}
exports.deleteBook=async(req,res,next)=>{
    try{
        const _id=req.query;
        const b=await book.findOne({_id:_id})
        if(!b){
            return res.status(400).json({message:'This Item Is Not In Our Library :('})
        }
        await fs.unlinkSync(b.fileUrl)
        await fs.unlinkSync(b.photoUrl)
        await book.deleteOne({_id:_id})
        return res.status(200).json({message:"Deleted Successfully!"})
    }catch(error){
        return res.status(500).json({error:error.message})
    }
}
exports.confirmBuying=async(req,res,next)=>{
    try {
        const orderId=req.query._id;
        const myOrder=await order.findOne({_id:orderId,state:"waiting!"})
        if(!myOrder){
            return res.status(400).json({message:"Order Confirmed Previously!"})
        }
        let ids2=[]; let t=true;
        const od=await orderDetails.find({orderId:orderId})
        for(let i=0;i<od.length;i++){
            const cb=await book.findOne({_id:od[i].bookId})
            if(cb.quantity<od[i].count){
                ids2.push(cb.name);
                t=false;
            }
        }
        if(t)
        {for(let i=0;i<od.length;i++){
            const b=await book.findOne({_id:od[i].bookId})
            await book.updateOne({_id:od[i].bookId},{quantity:b.quantity-od[i].count})
        }
        await order.updateOne({_id:orderId},{state:"Buy"})
        return res.status(202).json({message:"Confirmed Successfully!"})}
        else{
            return res.status(400).json({message:`Quantity Changes For These Items ${ids2} :(`})
        }
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}
//try to refactory it
exports.showOrders=async(req,res,next)=>{
    try {let id=[];
        const o=await order.find();
        for(let i=0;i<o.length;i++){
            const od=await orderDetails.find({orderId:o[i]._id}).populate('bookId').populate('orderId')
            id.push(od)
        }
        return res.status(200).json({data:id})
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}
exports.statistics=async(req,res,next)=>{
    try {
        let id=[]; let numberOfElementsBought=0;
        const b=await book.find()
        for(let i=0;i<b.length;i++){
            const BookInfo=await book.findOne({_id:b[i]._id}).select('name')
            const numberOfElementsCount=await orderDetails.find({bookId:b[i]._id})
            for(let j=0;j<numberOfElementsCount.length;j++){
                numberOfElementsBought+=numberOfElementsCount[j].count
            }
            id.push({BookInfo,numberOfElementsBought})
            numberOfElementsBought=0;
        }
        return res.status(200).json({data:id})
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