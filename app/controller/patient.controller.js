const patientModel = require("../database/Models/patientModel");
const appointmentModel = require("../database/Models/appointment.model")
const moment = require("moment");
class patient {
    static bookAppointment = async (req, res) => {
        try {
    
         
        
          //   user.Notification.push({
        //     type: "New appointment-request",
        //     message: `A new Appointment Request from ${req.body.userInfo.name}`,
        //     onclickPath: "/user/appointments",
        //   });
          await user.save();
          res.status(200).send({
            apiStatus: true,
            data: newAppointment,
            message: "Appointment Book successfully",
          });
        } catch (e) {
          res.status(500).send({
            apiStatus: false,
            data: e,
            message: e.message,
          });
        }
      };
      static bookingAvailablity = async (req, res) => {
        try {
          const date = moment(req.body.date, "DD-MM-YYYY").toString();
          const fromTime = moment(req.body.time, "HH-mm")
            .subtract(1, "hours")
            .toString();
          const toTime = moment(req.body.time, "HH-mm")
            .subtract(1, "hours")
            .toString();
          const doctorId = req.body.doctorId;
          const appointment = await appointmentModel.find({
            doctorId,
            date,
            time: {
              $gte: fromTime,
              $lte: toTime,
            },
          });
          if (appointment.length > 0) {
            res.status(200).send({
              apiStatus: true,
              message: "Appointment not available at this time",
            });
          } else {
            res.status(200).send({
              apiStatus: true,
              message: "Appointment  available at this time",
            });
          }
        } catch (e) {
          res.status(500).send({
            apiStatus: false,
            message: e,
            data: e.message,
          });
        }
      };
      static userAppointments = async (req, res) => {
        try {
          const userAppointments = await appointmentModel.find({
            userId: req.body.userId,
          });
          res.status(200).send({
            apiStatus: true,
            message: "users Appointment Fetch successfully",
            data: userAppointments,
          });
        } catch (e) {
          res.status(500).send({
            apiStatus: false,
            message: e.message,
            data: e,
          });
        }
      };
      static doctorAppointment = async (req, res) => {
        try {
          const doctorAppointments = await appointmentModel.find({
            doctorId: req.body.doctorId,
          });
          res.status(200).send({
            apiStatus: true,
            message: "doctor Appointment Fetch successfully",
            data: doctorAppointments,
          });
        } catch (e) {
          res.status(500).send({
            apiStatus: false,
            message: e.message,
            data: e,
          });
        }
      };
      static updateStatus = async (req, res) => {
        try {
          const { appointmentId, status } = req.body;
    
          const appointments = await appointmentModel.findByIdAndUpdate(
            appointmentId,
            { status }
          );
          const user = await userModel.findOne({ _id: appointments.userId });
    
          user.Notification.push({
            type: "status-update",
            message: `your appointment has been updated${status}`,
            onclickPath: "/doctor-appointment",
          });
          await user.save();
          res.status(200).send({
            apiStatus: true,
            data: appointments,
            message: "Appointment status updated",
          });
        } catch (e) {
          res.status(500).send({
            apiStatus: false,
            data: e,
            message: e.message,
          });
        }
      };
}
module.exports = patient;
