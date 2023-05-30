const userModel = require("../database/Models/user.model");
const doctorModel = require("../database/Models/doctor.model");
const cloudinary = require("../../middleware/cloudinary");
const reviewModel = require("../database/Models/reviewModel");
const weekModel = require("../database/Models/week.model");
const appointmentModel = require("../database/Models/appointment.model.js");
const nodemailer = require("nodemailer");
const slotModel = require("../database/Models/slots.model");
const durations = require('../database/Models/durations.model');
const mongoose = require("mongoose");
let mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sm6229639",
    pass: "wcffnlwtgbocomxo",
  },
});
var mailOptions;

class doctor {
  static all = async (req, res) => {
    try {
      const doctors = await doctorModel.find({ isDoctor: true });

      return  res.status(200).send({
        apiStatus: true,
        data: doctors,

        message: "fetched",
      });
    } catch (e) {
      return  res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static practicesLicence = async (req, res) => {
    try {
      const doctor = await doctorModel.findById(req.params.id);

      if (doctor.practiceLicense.public_id)
        await cloudinary.uploader.destroy(
          doctor.practiceLicense.public_id,
          function (result) {
            console.log(result);
          }
        );
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "doctorImages",
        width: 300,
        crop: "scale",
      });
      doctor.practiceLicense = {
        public_id: result.public_id,
        url: result.secure_url,
      };
      await doctor.save();
      return res.status(200).send({
        apiStatus: true,
        data: doctor,
        data: "practiceLicense uploaded success",
      });
    } catch (e) {
      return res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static AddDoctorData = async (req, res) => {
    try {
      const doctorData = await doctorModel.findById(req.params.id);

      (doctorData.geolocation = {
        type: req.body.type ? req.body.type : doctorData.geolocation.type,
        coordinates: [
          req.body.lat ? req.body.lat : doctorData.geolocation.coordinates[1], 
           req.body.lon ? req.body.lon : doctorData.geolocation.coordinates[0]
        ],
      }),
        (doctorData.about = req.body.about ? req.body.about : doctorData.about),
        (doctorData.about_ar = req.body.about_ar
          ? req.body.about_ar
          : doctorData.about_ar),
        (doctorData.website = req.body.website
          ? req.body.website
          : doctorData.website),
        (doctorData.experience = req.body.experience
          ? req.body.experience
          : doctorData.experience),
        (doctorData.waitingTime = req.body.waitingTime
          ? req.body.waitingTime
          : doctorData.waitingTime),
        (doctorData.feesPerCunsaltation = req.body.feesPerCunsaltation
          ? req.body.feesPerCunsaltation
          : doctorData.feesPerCunsaltation),
        (doctorData.address = {
          city: req.body.city ? req.body.city : doctorData.address.city,
          placeNumber: req.body.placeNumber
            ? req.body.placeNumber
            : doctorData.address.placeNumber,
          city_ar: req.body.city_ar
            ? req.body.city_ar
            : doctorData.address.city_ar,
          placeNumber_ar: req.body.placeNumber_ar
            ? req.body.placeNumber_ar
            : doctorData.address.placeNumber_ar,
        });
      doctorData.name_ar = req.body.name_ar
        ? req.body.name_ar
        : doctorData.name_ar;

      await doctorData.save();
      return  res.status(200).send({
        apiStatus: true,
        data: doctorData,
        message: "doctor Data added success",
      });
    } catch (e) {
      return  res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static addImages = async (req, res) => {
    try {
      const doctor = await doctorModel.findById(req.body.doctorId);
    doctor.img = []
      if (doctor) {
        const urls = [];
        const files = req.files;
        for (const file of files) {
          const { path } = file;

          const newPath = await cloudinary.uploader.upload(path, {
            folder: "clinicImages",
            width: 300,
            crop: "scale",
          });
             urls.push({ public_id: newPath.public_id, url: newPath.secure_url });
          
        }
        doctor.img = urls
        await doctor.save();
        return res.status(200).send({
          apiStatus: true,
          data: doctor,
          message: "clinic images uploaded",
        });
      }
    } catch (e) {
      return res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };

  static single = async (req, res) => {
    try {
      const fin = await doctorModel
        .findById(req.params.id)
        .populate("reviews")
        .select(
          " name_ar img specializeId userId feesPerCunsaltation address about about_ar geolocation ratingsQuantity ratingAverage"
        );
      const Singledoctor = await doctorModel.populate(fin, {
        path: "specializeId",
        select: "name name_ar",
      });
      if (!Singledoctor) {
        return  res.status(400).send({
          apiStatus: true,
          data: `No document for this id ${req.params.id}`,
        });
      }
      if (req.headers["lan"] == "ar") {
        try {
          return  res.status(200).send({
            apiStatus: true,
            doctorData: {
              id: Singledoctor._id,
              name: Singledoctor.name_ar,
              img: Singledoctor.img,
              city: Singledoctor.address.city_ar,
              placeNumber: Singledoctor.address.placeNumber_ar,
              profilePicture: Singledoctor.userId.profilePicture,
              specialize: Singledoctor.specializeId.name_ar,
              rating: Singledoctor.ratingAverage,
              Consultation: Singledoctor.feesPerCunsaltation,
              about: Singledoctor.about_ar,
              geolocation: Singledoctor.geolocation,
              ratingsQuantity: Singledoctor.ratingsQuantity,
            },
            message: "بيانات الدكتور",
          });
        } catch (e) {
          return  res.status(500).send({
            apiStatus: false,
            data: e,
            message: e.message,
          });
        }
      } else if (req.headers["lan"] == "en") {
        try {
          return  res.status(200).send({
            apiStatus: true,
            doctorData: {
              id: Singledoctor._id,
              name: Singledoctor.userId.name,
              img: Singledoctor.img,
              specialize: Singledoctor.specializeId.name,
              rating: Singledoctor.ratingAverage,
              city: Singledoctor.address.city,
              placeNumber: Singledoctor.address.placeNumber,
              Consultation: Singledoctor.feesPerCunsaltation,
              about: Singledoctor.about,
              geolocation: Singledoctor.geolocation,
              profilePicture: Singledoctor.userId.profilePicture,
              ratingsQuantity: Singledoctor.ratingsQuantity,
            },
            message: "doctor data fetched success",
          });
        } catch (e) {
          return  res.status(500).send({
            apiStatus: false,
            data: e,
            message: e.message,
          });
        }
      } else {
        return  res.status(400).send({
          apiStatus: false,
          message: "must send language in header",
        });
      }
    } catch (e) {
      return  res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static imgesUpdates = async (req, res) => {
    try {
      const doctor = await doctorModel.findById(req.params.id);
      const img = req.body.imgId;
      if (!req.file) {
        return res.status(200).send({ message: "no found file" });
      }
      for (let i = 0; i < doctor.img.length; i++) {
        if (doctor.img[i].public_id == img) {
          await cloudinary.uploader.destroy(img);
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "doctorImages",
            width: 300,
            crop: "scale",
          });
          doctor.img[i].public_id = result.public_id;
          doctor.img[i].url = result.secure_url;
          await doctor.save();
        }
      }
      return res.status(200).send({
        apiStatus: true,
        data: doctor.img.map((e) => {
          return {
            id: e.public_id,
            url: e.url,
          };
        }),
        message: "img changed success",
      });
    } catch (e) {
      return res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static me = async (req, res) => {
    try {
      const fin = await doctorModel.findOne({ userId: req.user._id });
      const doctor = await doctorModel.populate(fin, {
        path: "specializeId",
        select: "name",
      });
      return  res.status(200).send({
        apiStatus: true,
        doctorData: {
          geolocation: doctor.geolocation,
          address: (doctor.address = {
            city: doctor.address.city,
            placeNumber: doctor.address.placeNumber,
          }),
          name: doctor.userId.name,
          id: doctor._id,
          profilePicture: doctor.userId.profilePicture.url,
          phone: doctor.userId.phone,
          status: doctor.userId.status,
          timeslot: doctor.timeslots,
          ratingAverage: doctor.ratingAverage,
          specialize: doctor.specializeId.name,
          experience: doctor.experience,
          feesPerCunsaltation: doctor.feesPerCunsaltation,
          waitingTime: doctor.waitingTime,
          website: doctor.website,
          about: doctor.about,
          img: doctor.img,
        },
        message: "doctor profile",
      });
    } catch (e) {
      return  res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static getAllReviewsOnSpecificDoctor = async (req, res) => {
    try {
      const doctor = await reviewModel.find({ doctorId: req.params.id });
      return  res.status(200).send({
        apiStatus: true,
        data: doctor,
        message: "all review fetched success",
      });
    } catch (e) {
      return   res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static addSlot = async (req, res) => {
    try {
      const date = new Date();
      switch (date.getDay()) {
        case 0:
          date.setDate(date.getDate() - 1);
          break;
        case 1:
          date.setDate(date.getDate() - 2);
          break;
        case 2:
          date.setDate(date.getDate() - 3);
          break;
        case 3:
          date.setDate(date.getDate() - 4);
          break;
        case 4:
          date.setDate(date.getDate() - 5);
          break;
        case 5:
          date.setDate(date.getDate() - 6);
          break;
        case 6:
          date.setDate(date.getDate());
          break;
      }
     
      let startDate = new Date(date);
      let endDate = new Date(startDate).setDate(
        new Date(startDate).getDate() + 6
      );
      const ExistSlot = await slotModel
        .findOne({ doctorId: req.body.doctorId })
        .sort({ $natural: -1 });
      if (ExistSlot) {
        startDate = new Date(ExistSlot.weekId.startWeek).setDate(
          new Date(ExistSlot.weekId.startWeek).getDate() + 7
        );
        endDate = new Date(ExistSlot.weekId.endWeek).setDate(
          new Date(ExistSlot.weekId.endWeek).getDate() + 7
        );
      }
      var week = await new weekModel({
        startWeek: new Date(startDate).toISOString().slice(0, 10),
        endWeek: new Date(endDate).toISOString().slice(0, 10),
        doctorId: req.body.doctorId,
      });
      await week.save();

      const doctorDates = await  new  durations({
         doctorId:req.body.doctorId ,
         appointments:req.body.appointments,
         weekId:week._id
      }
      );

      await doctorDates.save();
      for (var i = 0; i < req.body.appointments.length; i++) {
        for (var j = 0; j < req.body.appointments[i].durations.length; j++) {
          for (
            var t = req.body.appointments[i].durations[j].from;
            t <= req.body.appointments[i].durations[j].to;
            t += 0.5
          ) {
            var slot = await new slotModel({
              weekId: week._id,
              from: t,
              to: t + 0.5,
              dayDate: new Date(
                new Date(startDate).setDate(
                  new Date(startDate).getDate() + req.body.appointments[i].dayNo
                )
              )
                .toISOString()
                .slice(0, 10),
              dayNo: req.body.appointments[i].dayNo,
              doctorId: req.body.doctorId,
              isAvailable: true,
              patientId: null,
            });
            await slot.save();
          }
        }
      }
    return  res.status(200).send({
        apiStatus: true,
        doctorDates,
      });
    } catch (e) {
      return   res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static getAllWeeks = async (req, res) => {
    try {
      const week = await weekModel.find({ doctorId: req.params.id });
      if (week.length == 0) {
        return res.status(200).send({
          apiStatus: true,
          message: "no weeks to show",
        });
      }
      return res.status(200).send({
        apiStatus: true,
        data: week.map((e) => {
          return {
            startWeek: e.startWeek,
            endWeek: e.endWeek,
            id: e._id,
          };
        }),
        message: "all weeks",
      });
    } catch (e) {
      return res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static getAllDaysOfWeek = async (req, res) => {
    try {
      const days = await slotModel.find({ weekId: req.params.id });
      if (days.length == 0) {
        return res.status(200).send({
          apiStatus: true,
          message: "not found slots to show",
        });
      }

      return res.status(200).send({
        apiStatus: true,
        data: days.map((e) => {
          return {
            day: e.dayDate,
            isAvailable: e.isAvailable,
            id: e._id,
            from: `${parseInt(e.from)}:${(e.from - parseInt(e.from)) * 60}`,
            to: `${parseInt(e.to)}:${(e.to - parseInt(e.to)) * 60}`,
          };
        }),
        message: "fetched",
      });
    } catch (e) {
      return  res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static previous = async (req, res) => {
    try {
      const appointmentAccept = await appointmentModel.find({
        status: "accepted",
        doctorId: req.params.id,
      });

      const fin = appointmentAccept.filter((e) => {
        if (e.slotId.dayDate < new Date().toISOString().slice(0, 10)) {
          return e;
        }
      });
      return  res.status(200).send({
        apiStatus: true,
        data: fin.map((doc) => {
          return {
            patientName: doc.name,
            address: doc.address,
            Patientnote: doc.PatientNote,
            PatientName: doc.patientName,
            phone: doc.phone,
            status: doc.status,
            time: `${parseInt(doc.slotId.from)}:${
              (doc.slotId.from - parseInt(doc.slotId.from)) * 60
            }`,
            dayDate: doc.slotId.dayDate,
            id: doc._id,
          };
        }),
      });
    } catch (e) {
      return  res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static getAppointmentCurrentAccept = async (req, res) => {
    try {
      const appointmentAccept = await appointmentModel.find({
        doctorId: req.params.id,
        status: "accepted",
      });
      const fin = appointmentAccept.filter((e) => {
        if (e.slotId.dayDate > new Date().toISOString().slice(0, 10)) {
          return e;
        }
      });

      return  res.status(200).send({
        apiStatus: true,
        data: fin.map((doc) => {
          return {
            patientName: doc.name,
            address: doc.address,
            Patientnote: doc.PatientNote,
            PatientName: doc.patientName,
            phone: doc.phone,
            status: doc.status,
            time: `${parseInt(doc.slotId.from)}:${
              (doc.slotId.from - parseInt(doc.slotId.from)) * 60
            }`,
            dayDate: doc.slotId.dayDate,
            id: doc._id,
          };
        }),
        n: fin.length,
      });
    } catch (e) {
      return  res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static getAppointmentCurrentPending = async (req, res) => {
    try {
      const appointmentAccept = await appointmentModel.find({
        doctorId: req.params.id,
        status: "pending",
      });
      const fin = appointmentAccept.filter((e) => {
        if (e.slotId.dayDate > new Date().toISOString().slice(0, 10)) {
          return e;
        }
      });
      return res.status(200).send({
        apiStatus: true,
        data: fin.map((doc) => {
          return {
            patientName: doc.name,
            address: doc.address,
            Patientnote: doc.PatientNote,
            PatientName: doc.patientName,
            phone: doc.phone,
            status: doc.status,
            time: `${parseInt(doc.slotId.from)}:${
              (doc.slotId.from - parseInt(doc.slotId.from)) * 60
            }`,
            dayDate: doc.slotId.dayDate,
            id: doc._id,
          };
        }),
        n: fin.length,
      });
    } catch (e) {
      return  res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static changeAppointmentStatus = async (req, res) => {
    try {
      const appointment = await appointmentModel.findById(req.params.id);
      appointment.status = req.body.status;
      await appointment.save();
      mailOptions = {
        from: '"Welcome to PHCP!" <sm6229639gmail.com>',
        to: appointment.patientId.email,
        subject: "Thank you for your appointment",
        html: `<h1 style='font-family: 'Proxima Nova',Helvetica,'Open Sans',Corbel,Arial,sans-serif;
  font-size: 17px;
  font-weight: bold;
  line-height: 1.24;
  letter-spacing: -0.1px;
  color: #4a4a4a;
  margin: 0; '>Ahlan ${appointment.patientId.name}</h1><p style='font-family: 'Proxima Nova',Helvetica,'Open Sans',Corbel,Arial,sans-serif;
  font-size: 13px;
  line-height: 1.62;
  color: #404553;
  letter-spacing: normal;'>Your Reservation with doctor <span style='font-weight:bold;'>${appointment.doctorId.userId.name}
  </span> has been ${req.body.status}.</p>`,
      };
      mailTransport.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Mail has been sent :- ", info.response);
        }
      });

      appointment.patientId.Notification.push({
        type: "Reservation status",
        message: `your reservation is ${req.body.status}`,
        data: {
          reservationId: appointment._id,
        },
      });
      appointment.patientId.save();
      return  res.status(200).send({
        apiStatus: true,
        data: appointment,
        message: `status changed success`,
      });
    } catch (e) {
      return res.status(500).send({
        apiStatus: true,
        data: e,
        message: e.message,
      });
    }
  };
  static editSlot = async (req, res) => {
    try {
      const from = req.body.from;
      const to = req.body.to;
      const slot = await slotModel.findOne({
        _id: mongoose.Types.ObjectId(req.params.id),
      });
      if (!slot) {
        return res.status(200).send({
          apiStatus: false,
          message: "not found slot ",
        });
      }
      const slotExist = await slotModel.findOne({
        _id: mongoose.Types.ObjectId(req.params.id),
        from: req.body.from,
        to: req.body.to,
        dayDate: slot.dayDate,
      });
      const resjd = await slotModel.findOne({
        _id: mongoose.Types.ObjectId(req.params.id),
        isAvailable: false,
      });
      if (slotExist || resjd) {
        return res.status(200).send({
          apiStatus: false,
          message: "slot is used before or aleardy reserved",
        });
      }
      slot.from = from;
      slot.to = to;
      await slot.save();
      return  res.status(200).send({
        apiStatus: true,
        data: slot,
        message: "slot edited success",
      });
    } catch (e) {
      return res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static deleteSlot = async (req, res) => {
    try {
      const slot = await slotModel.findOne({
        _id: mongoose.Types.ObjectId(req.params.id),
      });
      if (!slot) {
        return res.status(200).send({
          apiStatus: false,
          message: "not found slot",
        });
      }
      if (slot.isAvailable) {
        await slotModel.findByIdAndDelete(req.params.id);
      }

      await slot.save;
      return  res.status(200).send({
        apiStatus: true,
        message: "slot deleted success",
      });
    } catch (e) {
      return res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static getslot = async (req, res) => {
    try {
     const duration = await durations.findOne({
      doctorId:req.body.doctorId,
      weekId:req.body.weekId
     })
     return  res.status(200).send({
        apiStatus: true,
        data: duration,
        message: "get all slots",
      });
    } catch (e) {
      return res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
}

module.exports = doctor;
