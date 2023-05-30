const router = require("express").Router();
const adminController = require("../app/controller/admin.controller")
router.get("/all", adminController.all);
router.get("/getAlldoctors",adminController.getalldoctors);
router.get('/getAlldoctorsApproved',adminController.getAlldoctorApproved)
router.post("/changeDoctorStatus",adminController.changeDoctorStatus);

module.exports = router