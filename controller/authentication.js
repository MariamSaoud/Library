const express=require('express');
const user=require('../models/user');
const Token=require('../models/token');
const jwt=require('jsonwebtoken');
const SECRET_KEY="NOTESAPI";
module.exports=async(req,res,next)=>{
    const authHeader=await req.headers.authorization;
    if(!authHeader){
        return res.status(400).json({message:"Not Authenticated!!"})
    }
    const authHeader1=authHeader.split(' ')[1];
    const tokenData=await Token.findOne({token:authHeader1})
    if(!tokenData){
        return res.status(400).json({message:"Log In Then Try To Do It!"})
    }
    const token=authHeader.split(' ')[1];
    let decodedToken;
    try{
        decodedToken=jwt.verify(token,SECRET_KEY)
    }catch(error){
        return res.status(500).json({error:error.message})
    }
    if(!decodedToken){
        return res.status(400).json({message:"Not Allow To Do It!"})
    }
    req.id=await decodedToken._id;
    next();
}