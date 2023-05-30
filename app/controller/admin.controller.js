const userModel = require("../database/Models/user.model");
const doctorModel = require("../database/Models/doctor.model");
const cloudinary = require("../../middleware/cloudinary");
class admin {
  static getAlldoctorApproved = async (req, res) => {
    try {
      res.status(200).send({
        apiStatus: true,
        message: "Doctors fetched successfully",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static all = async (req, res) => {
    try {
      res.status(200).send({
        apiStatus: true,
        message: "all data fetched",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: true,
        data: e,
        message: e.message,
      });
    }
  };
  static changeDoctorStatus = async (req, res) => {
    try {
      const doctor = await doctorModel.findById(req.body.doctorId);
      if (doctor === null) {
        res.status(201).send({
          apiStatus: true,
          message: "you dont have doctor",
        });
      }
      doctor.status = req.body.status;
      await doctor.save();
      const user = await userModel.findOne({ _id: req.body.userId });
      const Notification = user.Notification;
      Notification.push({
        type: "doctor-account-request-updated",
        message: `Your Doctor Account Request Has ${req.body.status}`,
        onclickPath: "/notification",
      });
      await user.save();
      res.status(200).send({
        apiStatus: true,
        data: doctor,
        message: "Account status updated",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static getalldoctors = async (req, res) => {
    try {
      const pageNum = req.query.pageNum;
      const pageLimit = req.query.pageLimit || 0;
      const count = await userModel.count({
        isDoctor: true,
        status: "accepted",
      });
      const doctors = await userModel
        .find({ isDoctor: true, status: "accepted" })
        .limit(+pageLimit)
        .skip(pageLimit * pageNum);
      res.status(200).send({
        apiStatus: true,
        data: doctors,
        count,
        message: "doctors fetched successfully",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: true,
        data: e,
        message: e.message,
      });
    }
  };
}
module.exports = admin;
