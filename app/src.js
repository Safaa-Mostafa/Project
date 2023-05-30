require("dotenv").config();
require("../app/database/connection");
const cors = require("cors");
const express = require("express");
const { I18n } = require("i18n");
const path = require("path");
const app = express();

app.use(cors());
const ApiError = require("../utils/ApiError")
const globalError = require("../middleware/errorMiddleware")
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const i18n = new I18n({
  locales: ["ar", "en"],
  directory: path.join(__dirname, "translation"),
  defaultLocale: "en",
});
app.use(i18n.init);
app.use(function (req, res, next) {
  i18n.setLocale(req, req.headers["lan"]);
  next();
});

const doctorRoutes = require("../routes/doctor.api");
app.use("/doctor", doctorRoutes);
const specializeRoutes = require("../routes/specialize.api");
app.use("/specialize", specializeRoutes);
const patientRoutes = require("../routes/patient.api");
app.use("/patient", patientRoutes);

const reviewRoute = require("../routes/review.api");
app.use("/review", reviewRoute);

const adminRoute = require("../routes/admin.api");
app.use("/admin", adminRoute);

const userRoutes = require("../routes/user.api");
app.use("/user", userRoutes);
app.all("*", (req, res, next) => {
  next(new ApiError(`can't find this route: ${req.originalUrl}`,400))
});
app.use(globalError);

module.exports = app;
