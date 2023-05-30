const router = require("express").Router();
const auth = require("../middleware/auth");
const patientController = require("../app/controller/patient.controller");
const upload1 = require("../middleware/upload");

router.post("/bookAppointment", patientController.bookAppointment);

module.exports = router;
