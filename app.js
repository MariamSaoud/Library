const express=require("express");
const mongoose=require('mongoose');
const multer=require('multer');
const bodyParser=require('body-parser');
const path=require('path');
const fs=require('fs');
const User=require('./models/user');
const app=express();
//revise models here and rewrite it
mongoose.connect('mongodb://localhost:27017/Library')
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
//use path
app.use(express.static(path.join(__dirname,"library")))
app.use('/images',express.static(__dirname+'/images'))
//setHeader
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "content-type,Authorization");
    next();
});
//multer option
const fileStorage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'images')
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+'-'+file.originalname)
    }
})
const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/png'||file.mimetype==='image/jpg'||file.mimetype==='image/jpeg'||file.mimetype==='application/pdf'){
        cb(null,true)
    }
}
app.use(multer({storage:fileStorage,fileFilter:fileFilter}).array('images'))
//
const userRouter=require('./router/user');
const adminRouter=require('./router/admin');
app.use('/user',userRouter)
app.use('/admin',adminRouter)
const PORT=process.env.PORT||3333;
app.listen(PORT,()=>{
    console.log(`Listening On Port ${PORT}`)
})