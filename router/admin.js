const express=require('express');
const router=express();
const authorization=require('../controller/authentication');
const adminController=require('../controller/admin');
const adminCanDo=require('../permissions/adminCanDo');
router.post('/SignUp',adminController.SignUp);
router.post('/Login',adminController.Login);
router.post('/Logout',authorization,adminCanDo.adminCanDo,adminController.Logout)
//category
router.post('/addCategory',authorization,adminCanDo.adminCanDo,adminController.addCategory)
router.post('/updateCategory',authorization,adminCanDo.adminCanDo,adminController.updateCategory)
router.delete('/deleteCategory',authorization,adminCanDo.adminCanDo,adminController.deleteCategory)
//author
router.post('/addAuthor',authorization,adminCanDo.adminCanDo,adminController.addAuthor)
router.post('/updateAuthor',authorization,adminCanDo.adminCanDo,adminController.updateAuthor)
router.delete('/deleteAuthor',authorization,adminCanDo.adminCanDo,adminController.deleteAuthor)
//books
router.post('/addBook',authorization,adminCanDo.adminCanDo,adminController.addBook)
router.post('/ConfirmaddedBook',authorization,adminCanDo.adminCanDo,adminController.ConfirmaddedBook)
router.post('/updateBookDetails',authorization,adminCanDo.adminCanDo,adminController.updateBookDetails)
router.post('/updateBookFiles',authorization,adminCanDo.adminCanDo,adminController.updateBookFiles)
router.post('/deleteBook',authorization,adminCanDo.adminCanDo,adminController.deleteBook)
router.post('/confirmBuying',authorization,adminCanDo.adminCanDo,adminController.confirmBuying)
//geters
router.get('/showBooks',authorization,adminCanDo.adminCanDo,adminController.showBooks)
router.get('/showOrders',authorization,adminCanDo.adminCanDo,adminController.showOrders)
router.get('/statistics',authorization,adminCanDo.adminCanDo,adminController.statistics)
router.get('/search',authorization,adminCanDo.adminCanDo,adminController.search)
module.exports=router;