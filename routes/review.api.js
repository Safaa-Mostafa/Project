const reviewController = require("../app/controller/review.Controller")
const router = require("express").Router();
const auth = require("../middleware/auth");
router.post('/addReview',auth,reviewController.addReview)
router.patch('/editReview/:id',auth,reviewController.editReview)
router.delete('/deleteReview/:id',auth,reviewController.deleteReview)
router.get('/all',auth,reviewController.allReview)
router.get('/all/:id',auth,reviewController.single)

module.exports =router 