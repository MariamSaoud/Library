const express=require('express');
const userController=require('../controller/user');
const authorization=require('../controller/authentication');
const userCanDo=require('../permissions/userCanDo');
const router=express();
router.post('/SignUp',userController.SignUp);
router.post('/Login',userController.Login);
router.post('/Logout',authorization,userCanDo.userCanDo,userController.Logout)
//books and orders
router.post('/askForPublish',authorization,userCanDo.userCanDo,userController.askForaddingBook)
router.post('/askforBuying',authorization,userCanDo.userCanDo,userController.askforBuying)
router.post('/addToFav',authorization,userCanDo.userCanDo,userController.addToFav)
router.delete('/removeFromFav',authorization,userCanDo.userCanDo,userController.removeFromFav)
router.delete('/cancelFromOrder',authorization,userCanDo.userCanDo,userController.cancelFromOrder)
router.delete('/cancelOrder',authorization,userCanDo.userCanDo,userController.cancelOrder)
//showBooks
router.get('/showBooks',authorization,userCanDo.userCanDo,userController.showBook)
router.get('/showOrders',authorization,userCanDo.userCanDo,userController.showOrder)
router.get('/showFav',authorization,userCanDo.userCanDo,userController.showFav)
router.get('/search',authorization,userCanDo.userCanDo,userController.search)
module.exports=router;