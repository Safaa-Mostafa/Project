const router = require("express").Router();
const auth = require("../middleware/auth");
const upload1 = require("../middleware/upload");
const diagonesController = require("../app/controller/diagones.controller");
router.post(
  "/addDiagnosis",
  auth,
  upload1.single("img"),
  diagonesController.addDiagnosis
);
router.put(
  "/all/:id",
  auth,
  upload1.single("img"),
  diagonesController.editDiagnosis
);
router.delete("/all/:id", auth, diagonesController.deleteDiagnosis);
module.exports = router;
