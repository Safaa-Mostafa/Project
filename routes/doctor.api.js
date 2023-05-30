const router = require("express").Router();
const auth = require("../middleware/doctorauth");
const doctorController = require("../app/controller/doctor.controller");
const upload1 = require("../middleware/upload");

router.post('/all/:id',upload1.single('img'),doctorController.practicesLicence)
router.get('/all/:id',doctorController.single)
router.post('/doctorData/:id',auth,doctorController.AddDoctorData)
router.get('/all',doctorController.all)
router.post('/clinicImgs',auth,upload1.array('img',5),doctorController.addImages)
router.get('/review/:id',doctorController.getAllReviewsOnSpecificDoctor)
router.get('/me',auth,doctorController.me)
router.post('/addWorkTime',auth,doctorController.addSlot)
router.post('/updateImg/:id',upload1.single('img'),doctorController.imgesUpdates)
router.get('/get-previous-appointment/:id',auth,doctorController.previous)
router.get('/get-accept-appointment/:id',auth,doctorController.getAppointmentCurrentAccept)
router.post('/changeAppointmentStatus/:id',auth,doctorController.changeAppointmentStatus)
router.get('/get-pending-appointment/:id',auth,doctorController.getAppointmentCurrentPending)
router.get('/all-week/:id',auth,doctorController.getAllWeeks)
router.get('/All-days-week/:id',auth,doctorController.getAllDaysOfWeek)
router.patch('/edit-slot/:id',auth,doctorController.editSlot)
router.delete('/delete-slot/:id',auth,doctorController.deleteSlot)
router.get('/get-slots',auth,doctorController.getslot)
module.exports = router;
