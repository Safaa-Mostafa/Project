const router = require("express").Router();
const auth = require("../middleware/auth");
const userController = require("../app/controller/user.controller");
const upload1 = require("../middleware/upload");
const frebase = require("../app/controller/push-notification.controller");
router.post('/addNotify/:id',auth,frebase.addNotify)
router.delete("/all", auth, userController.deleteAccount);
router.patch("/edit-user-data", auth, userController.editUser);
router.patch("/changePass", auth, userController.editPass);
router.get("/profile", auth, userController.profile);
router.post("/upload",auth, upload1.single("img"), userController.uploadImage);
router.post("/login", userController.login);
router.get("/logout", auth, userController.logout);
router.post("/register", upload1.single("img"), userController.register);
router.post("/verify", userController.verify);
router.post("/send", userController.send);
router.post("/forgotPass", userController.forgot_password);
router.post("/passwordVerify", userController.passwordVerify);
router.get("/search", userController.search);
router.post("/all-notification",auth, userController.getAllNotification);
router.get("/notification",auth, userController.notification);
router.post("/delete-notification", userController.deleteAllNotification);
router.get("/",userController.home)
router.get("/sortPrice", userController.sortPrice);
router.post("/nearstDoctor", userController.findDoctorbySpecialize);
router.post('/findDoctors',userController.find)
router.post('/MakeAppointment/:id',auth,userController.makeAppointment)
router.get('/getSlot/:id',userController.getSlot)
router.post('/contact-us',auth,userController.contact_us)
router.get('/current-appointment',auth,userController.allAppointmentCurrent)
router.get('/previous-appointment',auth,userController.previous)
module.exports = router;
