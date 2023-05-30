const userModel = require("../database/Models/user.model");
const bcrypt = require("bcryptjs");
const doctorModel = require("../database/Models/doctor.model");
const patientModel = require("../database/Models/patientModel");
const diseaseModel = require("../database/Models/diseaseModel");
const specializeModel = require("../database/Models/specialize.model");
const cloudinary = require("../../middleware/cloudinary");
const nodemailer = require("nodemailer");
const FCM = require("fcm-push");
const serverKey ="AAAA1UYUt-E:APA91bFbvp1s9-3c6MMwj_Bo6KEKDp5PxipRTHzso-sIImtbSeVkPzjgsAtTfDOnEW0nP0wBZnb8wMfh-3BUptSWORBmCvmEF7WQRjstAcFHCvydo_Xjrv2ozK7h9bo8Jl5NMIipK59z";
const mongoose = require("mongoose");
const appointmentModel = require("../database/Models/appointment.model");
const weekModel = require("../database/Models/week.model");
const contactModel = require("../database/Models/contact-us.model");
const slotModel = require("../database/Models/slots.model");
const duration = require("../database/Models/durations.model");
var fcm = new FCM(serverKey);

let mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sm6229639@gmail.com",
    pass: "wcffnlwtgbocomxo",
  },
});

function generateOTP() {

  var digits = '01234567899348864378564387562367498658736598365987635876324938912318371248632483583465748368738543648687647386743867438687368376';
  let OTP = '';
  for (let i = 0; i < 4; i++ ) {
      OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

var mailOptions;
class user {

  static uploadImage = async (req, res) => {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "doctorImages",
        width: 300,
        crop: "scale",
      });
      const user = await userModel.findById(req.user._id);
      if (user.profilePicture.public_id)
        await cloudinary.uploader.destroy(
          user.profilePicture.public_id,
          function (result) {
            console.log(result);
          }
        );
      user.profilePicture = {
        public_id: result.public_id,
        url: result.secure_url,
      };
      await user.save();
      return res.status(200).send({
        apiStatus: true,
        user,
        data: "profile picture uploaded success",
      });
    } catch (e) {
      return  res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };

  static home = async (req, res) => {
    try {
      const specialize = await specializeModel.aggregate([
        {
          $lookup: {
            from: "doctors",
            localField: "_id",
            foreignField: "specializeId",
            as: "doctors",
          },
        },
        {
          $project: {
            _id: 1,
            name_ar: 1,
            name: 1,
            img: 1,
            number_of_doctors: { $size: "$doctors" },
          },
        },
      ]);

      if (req.headers["lan"] == "ar") {
        const doctor = await doctorModel
          .find()
          .select(
            "_id  name_ar profilePicture specializeId ratingAverage feesPerCunsaltation"
          );
        const fin = await doctorModel.populate(doctor, {
          path: "specializeId",
          select: "name name_ar",
        });

        const disease = await diseaseModel.find().select("_id name_ar img");
        return res.status(200).send({
          apiStatus: true,
          doctors: fin.map((doc) => {
            return {
              id: doc._id,
              name: doc.name_ar,
              profile: doc.userId.profilePicture.url,
              specialize: doc.specializeId ? doc.specializeId.name_ar : "",
              rating: doc.ratingAverage ? doc.ratingAverage : 0,
              feesPerCunsaltation: doc.feesPerCunsaltation,
            };
          }),
          disease: disease.map((doc) => {
            return {
              id: doc._id,
              name: doc.name_ar,
              img: doc.img,
            };
          }),
          specializes: specialize.map((doc) => {
            return {
              id: doc._id,
              name: doc.name_ar,
              img: doc.img
                ? doc.img.url
                : "https://res.cloudinary.com/dlivgib8n/image/upload/v1681157190/specializeImgs/szavdrllvtzkjd9i8ita.png",
              number_of_doctors: doc.number_of_doctors,
            };
          }),
          message: "all data fetched success",
        });
      }
      if (req.headers["lan"] == "en") {
        const doctor = await doctorModel
          .find()
          .select(
            "_id  name profilePicture specializeId ratingAverage feesPerCunsaltation"
          );
        const fin = await doctorModel.populate(doctor, {
          path: "specializeId",
          select: "name name_ar",
        });

        const disease = await diseaseModel.find().select("_id name img");
        return res.status(200).send({
          apiStatus: true,
          doctors: fin.map((doc) => {
            return {
              id: doc._id,
              name: doc.userId.name,
              profile: doc.userId.profilePicture.url,
              specialize: doc.specializeId ? doc.specializeId.name : "",
              rating: doc.ratingAverage ? doc.ratingAverage : 0,
              feesPerCunsaltation: doc.feesPerCunsaltation,
            };
          }),
          disease: disease.map((doc) => {
            return {
              id: doc._id,
              name: doc.name,
              img: doc.img,
            };
          }),
          specializes: specialize.map((doc) => {
            return {
              id: doc._id,
              name: doc.name,
              img: doc.img
                ? doc.img.url
                : "https://res.cloudinary.com/dlivgib8n/image/upload/v1681157190/specializeImgs/szavdrllvtzkjd9i8ita.png",
              number_of_doctors: doc.number_of_doctors,
            };
          }),
          message: "all data fetched success",
        });
      } else {
        return res.status(203).send({
          apiStatus: false,
          data: "must determine language",
        });
      }
    } catch (e) {
      return res.status(e).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static deleteAccount = async (req, res) => {
    try {
      const user = await userModel.findById(req.user.id);
      if (user.isPatient) {
        const checkPass = await bcrypt.compare(
          req.body.password,
          user.password
        );
        if (checkPass) {
          await userModel.findByIdAndRemove(req.user.id);
          await patientModel.findOneAndRemove({ userId: req.user.id });
          await appointmentModel.deleteMany({patientId:req.user._id})
          return res.status(200).send({
            apiStatus: true,
            message: "Patient Account has been deleted",
          });
        } else {
          return res.status(200).send({
            message: "password is incorrect",
          });
        }
      } else if (user.isDoctor) {
        const checkPass = await bcrypt.compare(
          req.body.password,
          user.password
        );
        if (checkPass) {
          await userModel.findByIdAndRemove(req.user.id);
          const doctor = await doctorModel.findOneAndRemove({ userId: req.user.id });
          await appointmentModel.deleteMany({doctorId:doctor._id})
          await weekModel.deleteMany({doctorId:doctor._id})
          await duration.deleteMany({doctorId:doctor._id})
          return res.status(200).send({
            message: "account deleted success",
          });
        } else {
          return res.status(200).send({
            message: "password is incorrect",
          });
        }
      } else if (user.isAdmin) {
        const checkPass = await bcrypt.compare(
          req.body.password,
          user.password
        );
        if (checkPass) {
          await userModel.findByIdAndDelete(req.user.id);
        } else {
          return res.status(200).send({
            message: "password is incorrect",
          });
        }
      } else {
        return res.status(200).send({ data: "email Not found" });
      }
    } catch (e) {
      return res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static editUser = async (req, res) => {
    try {
      const myUpdates = Object.keys(req.body);
      const allowedEdits = ["name", "phone"];
      const validEdits = myUpdates.every((update) =>
        allowedEdits.includes(update)
      );
      if (!validEdits) throw new Error("invalid edits");
      const user = await userModel.findById(req.user.id);
      if (!user) throw new Error("invalid id");
      myUpdates.forEach((update) => (user[update] = req.body[update]));
      await user.save();
      return res.status(200).send({
        apiStatus: true,
        date: user,
        message: "user data updated",
      });
    } catch (e) {
      return res.status(500).send({
        apiStatus: false,
        date: e,
        message: e.message,
      });
    }
  };
  static find = async (req, res) => {
    try {
      const specialize = req.body.specializeId;
      const doctorsData = await doctorModel.find({
        specializeId: req.body.specializeId,
      });
      const dShs = await doctorModel.populate(doctorsData, {
        path: "specializeId",
        select: "name name_ar _id",
      });
      const dj = await doctorModel.populate(dShs, {
        path: "userId",
        select: "name profilePicture _id ",
      });
      if (req.headers["lan"] == "en") {
        return   res.status(200).send({
          apiStatus: true,
          data: dj.map((doc) => {
            return {
              name: doc.userId.name,
              specialize: doc.specializeId.name,
              rating: doc.ratingAverage,
              profilePicture: doc.userId.profilePicture.url,
              distance: doc.distance,
              fees:doc.feesPerCunsaltation,
              id: doc._id,
            };
          }),
          message: "doctors fetched successfully",
        });
      } else if (req.headers["lan"] == "ar") {
        return  res.status(200).send({
          apiStatus: true,
          data: dj.map((doc) => {
            return {
              name: doc.name_ar,
              specialize: doc.specializeId.name_ar,
              rating: doc.ratingAverage,
              profilePicture: doc.userId.profilePicture.url,
              distance: doc.distance,
              fees:doc.feesPerCunsaltation,
              id: doc._id,
            };
          }),
          message: "بيانات الدكتور",
        });
      } else {
        return  res.status(200).send({
          apiStatus: true,
          message: "must send language in headers",
        });
      }
    } catch (e) {
      return  res.status(500).send({
        apiStatus: true,
        data: e,
        message: e.message,
      });
    }
  };
  static editPass = async (req, res) => {
    try {
      const valid = await userModel.checkPass(req.user.id, req.body.oldPass);
      if (!valid) throw new Error("enter correct pass");
      valid.password = req.body.password;
      await valid.save();
      return res.status(200).send({
        apiStatus: true,
        data: valid,
        message: "password updated",
      });
    } catch (e) {
      return res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static login = async (req, res) => {
    try {
      const userData = await userModel.login(req.body.email, req.body.password);
      const token = await userData.generateToken();
      if (userData.isDoctor) {
        const doctor = await doctorModel.findOne({ userId: userData.id });
        return res.status(200).send({
          apiStatus: true,
          isDoctor: userData.isDoctor,
          doctor: {
            practiceLicense: doctor.practiceLicense,
            address: doctor.address,
            geolocation: doctor.geolocation,
            ratingAverage: doctor.ratingAverage,
            profilePicture: doctor.userId.profilePicture,
            name: doctor.userId.name,
            name_ar: doctor.name_ar,
            status: doctor.userId.status,
            phone: doctor.userId.phone,
            id: doctor._id,
            ratingsQuantity: doctor.ratingAverage,
            specializeId: doctor.specializeId,
            img: doctor.img,
            about: doctor.about,
            about_ar: doctor.about_ar,
            experience: doctor.experience,
            website: doctor.website,
            waitingTime: doctor.waitingTime,
          },
          token,
          message: "Logged In",
        });
      }
      return res.status(200).send({
        apiStatus: true,
        data: { userData, token },
        message: "Logged In",
      });
    } catch (e) {
      return res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static profile = (req, res) => {
    res
      .status(200)
      .send({ apiStatus: true, data: req.user, message: "user profile" });
  };
  static logout = async (req, res) => {
    try {
      req.user.tokens = req.user.tokens.filter((t) => t.token != req.token);
      await req.user.save();
      return  res.status(200).send({
        apiStatus: true,
        data: "",
        message: "logged out on device",
      });
    } catch (e) {
      return res.status(500).send({ apiStatus: false, data: e, message: e.message });
    }
  };

  static register = async (req, res) => {
    try {
      const userExist = await userModel.findOne({ email: req.body.email });
      if (userExist) {
        res
          .status(200)
          .send({ apiStatus: false, massage: "user is already exits" });
      } else {
        if (req.body.isDoctor) {
          try {
            const doctor = new userModel({
              name: req.body.name,
              email: req.body.email,
              phone: req.body.phone,
              password: req.body.password,
              isDoctor: req.body.isDoctor,
              status: "pending",
            });
            const token = await doctor.generateToken();

            const doctorData = new doctorModel({
              userId: doctor._id,
              specializeId: req.body.specializeId,
            });
            if (req.file) {
              const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "userImages",
                width: 300,
                crop: "scale",
              });
              doctor.profilePicture = {
                public_id: result.public_id,
                url: result.secure_url,
              };
            } else {
              doctor.profilePicture = {
                url: "https://res.cloudinary.com/dlivgib8n/image/upload/v1681133143/th_yjukuo.jpg",
              };
            }
            doctor.uniqueString =generateOTP()
            await doctor.save();
            await doctorData.save();

            mailOptions = {
              from: '"Welcome to PHCP!" <sm6229639gmail.com>',
              to: req.body.email,
              subject: "Please confirm your Email account",
              html: `<div style=' font-size:14px;'>Thanks ${doctor.name} for signing up. 
                your verificaton code is ${doctor.uniqueString}
                If you are having any issues with your account, please don't 
                hesitate to contact us by replying to this mail.</div>`,
            };
            mailTransport.sendMail(mailOptions, (err, info) => {
              if (err) {
                console.log(err);
              } else {
                console.log("Mail has been sent :- ", info.response);
              }
            });
            const adminUser = await userModel.findOne({ isAdmin: true });
            if (adminUser) {
              const Notification = adminUser.Notification;
              Notification.push({
                type: "apply-doctor-request",
                message: `${doctor.name}  has applied for a doctor account`,
                data: {
                  doctorId: doctor._id,
                  name: doctor.name,
                  onclickPath: "/admin/doctors",
                },
              });
            }
            await adminUser.save();
            
            return res.status(200).send({
              apiStatus: true,
              return: {
                name: doctor.name,
                email: doctor.email,
                phone: doctor.phone,
                isDoctor: doctor.isDoctor,
                status: doctor.status,
                specializeId: doctorData.specializeId,
                profilePicture: doctor.profilePicture,
                id: doctorData._id,
              },
              token,
              massage: "doctor added success",
            });
          } catch (e) {
            console.log("error");
            return res.status(500).send({
              apiStatus: false,
              data: e,
              message: e.message,
            });
          }
        }
        if (req.body.isAdmin) {
          try {
            const admin = new userModel({ ...req.body });
            await admin.save();
            return res.status(200).send({
              apiStatus: true,
              data: admin,
              message: "admin added success",
            });
          } catch (e) {
            return res.status(500).send({
              apiStatus: false,
              data: e,
              message: e.message,
            });
          }
        } else {
          try {
            req.body.isPatient = true;
            const Patient = new userModel({
              name: req.body.name,
              email: req.body.email,
              phone: req.body.phone,
              password: req.body.password,
              isPatient: req.body.isPatient,
            });
            const token = await Patient.generateToken();

            const PatientData = new patientModel({
              userId: Patient._id,
            });
            Patient.uniqueString =generateOTP()
            await PatientData.save();
            await Patient.save();
            mailOptions = {
              from: '"Welcome to PHCP!" <sm6229639gmail.com>',
              to: req.body.email,
              subject: "Please confirm your Email account",
              html: `<div style='display:flex;justify-content:center;text-align:center;background-color:#fff; 
                padding:20px;'>Thanks ${Patient.name} for signing up. 
                your verificaton code is ${Patient.uniqueString}
                If you are having any issues with your account, please don't 
                hesitate to contact us by replying to this mail.</div>`,
            };
            mailTransport.sendMail(mailOptions, (err, info) => {
              if (err) {
                console.log(err);
              } else {
                console.log("Mail has been sent :- ", info.response);
              }
            });
           
          
            return res.status(200).send({
              apiStatus: true,
              data: { Patient, token },
              massage: "patient added success",
            });
          } catch (e) {
            return res.status(500).send({
              apiStatus: false,
              data: e,
              message: e.message,
            });
          }
        }
      }
    } catch (e) {
      return res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static send = async (req, res) => {
    try {
      const user = await userModel.findOne({ email: req.body.email });
      user.uniqueString = generateOTP()
      mailOptions = {
        from: '"Clinic "<sm6229639gmail.com>',
        to: req.body.email,
        subject: "Please confirm your Email account",
        html:
          "<h4 style='color:blue'><b>verifing your email your code is </b></h4>" +
          user.uniqueString,
      };
      mailTransport.sendMail(mailOptions, function (err, res) {
        if (err) {
          console.log(err);
        } else {
          console.log("message sent");
        }
      });
      await user.save();
      return res.status(200).send({
        apiStatus: true,
        data: { user },
        message: "user Added successfully",
      });
    } catch (E) {
      return  res.status(500).send({
        apiStatus: false,
        data: E,
        message: E.message,
      });
    }
  };
  static verify = async (req, res) => {
    try {
      const user = await userModel.findOne({ uniqueString: req.body.code });
      if (user) user.Isverified = true;
      if (!user) throw new Error("code is not valid");
      const token = user.tokens[0].token;
      if (user.isDoctor) {
        const doctor = await doctorModel.findOne({ userId: user._id });
        return  res.status(200).send({
          apiStatus: true,
          data: { doctor, token },
          message: "verified",
        });
      }

      if (user) await user.save();
      return res.status(200).send({
        apiStatus: true,
        data: { user, token },
        message: "verified",
      });
    } catch (E) {
     return  res.status(500).send({
        apiStatus: false,
        data: E,
        message: E.message,
      });
    }
  };
  static forgot_password = async (req, res) => {
    try {
      const userData = await userModel.findOne({ email: req.body.email });
      if (!userData) {
        return  res.status(200).send({
          apiStatus: true,
          message: "user don't exist",
        });
      }
      const email = req.body.email;
      const random = generateOTP()
      if (userData) {
        const data = await userModel.findByIdAndUpdate(userData.id, {
          $set: { RandomNumber: random },
        });
        mailOptions = {
          from: '"Clinic"<sm6229639gmail.com>',
          to: email,
          subject: "For Reset Password",
          html: `
      

    <div style="max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #e3e3e3;
    border-radius: 10px;">
		<h1 style="font-size: 32px;
    text-align: center;
    margin-top: 0;">Forgot Your Password</h1>

		<p style="font-size: 16px;">We received a request to reset your password. Please enter the following code to complete the process:</p>

		<div style = "display: inline-block;
    padding: 10px;
    background-color: #f1f1f1;
    border-radius: 5px;
    font-size: 24px;
     margin :auto;">${random}</div>

		<p style="font-size: 16px;">If you did not initiate this request, please contact us immediately.</p>

		<div style="font-size: 12px;
    color: #999;
    text-align: center;
    margin-top: 50px;">
			<p style="font-size: 16px;">This email was sent to you because you requested a password reset. If you did not request this, please ignore this message.</p>
			<p style="font-size: 16px;">HCPC. All rights reserved.</p>
		</div>
	</div>
`
        };
        mailTransport.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Mail has been sent :- ", info.response);
          }
        });
        return res.status(200).send({
          apiStatus: true,
          message: "check your inbox of mail and reset your password.",
        });
      } else {
        return res.status(200).send({
          message: "email not found",
        });
      }
    } catch (e) {
      return  res.status(500).send({ apiStatus: false, data: e, message: e.message });
    }
  };
  static passwordVerify = async (req, res) => {
    try {
      const user = await userModel.findOne({
        RandomNumber: req.body.randomString,
      });
      if(user){
        user.password = req.body.password;
        await user.save();
        return  res.status(200).send({
          apiStatus: true,
          message: "password changed successfully",
        });
      }
      if (!user) throw new Error("code is not valid");
    
    } catch (e) {
      return  res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static search = async (req, res) => {
    try {
      const doctors = await doctorModel.find({
        $or: [
          { firstName: { $regex: req.query.doctorName } },
          { specialization: { $regex: req.query.specialize } },
         
        ],
        status: "accepted",
      });
      if (doctors.length === "") {
        return  res.status(201).send({
          apiStatus: true,
          message: "not found doctors",
        });
      }
      return res.status(200).json({ doctors, nbHit: doctors.length });
    } catch (e) {
      return  res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static findDoctorbySpecialize = async (req, res) => {
    try {
      const Latitude = req.body.Latitude;
      const Longitude = req.body.Longitude;
      if (req.body.specializeId) {
        let doctorData = await doctorModel.aggregate([
          {
            $geoNear: {
              near: {
                type: "point",
                coordinates: [parseFloat(Latitude), parseFloat(Longitude)],
              },
              distanceField: "distance.calculated",
              maxDistance: 4000,

              key: "geolocation",
            },
          },
          {
            $match: {
              specializeId: mongoose.Types.ObjectId(req.body.specializeId),
            },
          },
        ]);
        const dShs = await doctorModel.populate(doctorData, {
          path: "specializeId",
          select: "name name_ar",
        });
        const dj = await doctorModel.populate(dShs, {
          path: "userId",
          select: "name profilePicture _id",
        });
        if (req.headers["lan"] == "en") {
          return  res.status(200).send({
            apiStatus: true,
            data: dj.map((doc) => {
              return {
                name: doc.userId.name,
                fees:doc.feesPerCunsaltation,
                specialize: doc.specializeId.name,
                rating: doc.ratingAverage,
                profilePicture: doc.userId.profilePicture.url,
                distance: doc.distance,
                id: doc._id,
              };
            }),
            message: "doctors fetched successfully",
          });
        } else if (req.headers["lan"] == "ar") {
          return  res.status(200).send({
            apiStatus: true,
            data: dj.map((doc) => {
              return {
                name: doc.name_ar,
                specialize: doc.specializeId.name_ar,
                rating: doc.ratingAverage,
                profilePicture: doc.userId.profilePicture.url,
                distance: doc.distance,
                id: doc._id,
                fees:doc.feesPerCunsaltation
              };
            }),
            nbHit: doctorData.length,
            message: "بيانات الدكتور",
          });
        } else {
          return  res.status(200).send({
            apiStatus: true,
            message: "must send language in headers",
          });
        }
      } else if (req.body.specializeId == null || req.body.specializeId == "") {
        let doctorData = await doctorModel.aggregate([
          {
            $geoNear: {
              near: {
                type: "point",
                coordinates: [parseFloat(Latitude), parseFloat(Longitude)],
              },
              distanceField: "distance.calculated",
              maxDistance: 4000,

              key: "geolocation",
            },
          },
        ]);
        const dShs = await doctorModel.populate(doctorData, {
          path: "specializeId",
          select: "name name_ar",
        });
        const dj = await doctorModel.populate(dShs, {
          path: "userId",
          select: "name profilePicture _id",
        });
        if (req.headers["lan"] == "en") {
          return  res.status(200).send({
            apiStatus: true,
            data: dj.map((doc) => {
              return {
                name: doc.userId.name,
                specialize: doc.specializeId.name,
                rating: doc.ratingAverage,
                profilePicture: doc.userId.profilePicture.url,
                distance: doc.distance,
                fees:doc.feesPerCunsaltation,
                id: doc._id,
              };
            }),
            message: "doctors fetched successfully",
          });
        } else if (req.headers["lan"] == "ar") {
          return res.status(200).send({
            apiStatus: true,
            data: dj.map((doc) => {
              return {
                name: doc.name_ar,
                specialize: doc.specializeId.name_ar,
                rating: doc.ratingAverage,
                profilePicture: doc.userId.profilePicture.url,
                distance: doc.distance,
                fees:doc.feesPerCunsaltation,
                id: doc._id,
              };
            }),
            nbHit: doctorData.length,
            message: "بيانات الدكتور",
          });
        } else {
          return  res.status(200).send({
            apiStatus: false,
            message: "must send language in headers",
          });
        }
      }
    } catch (e) {
      return res.status(500).send({ apiStatus: false, message: e.message, data: e });
    }
  };
  static sortPrice = async (req, res) => {
    try {
      if (req.query.SortByValue == 1) {
        var dh = { feesPerCunsaltation: 1 };
      } else if (req.query.SortByValue == 2) {
        var dh = { waitingTime: 1 };
      } else if (req.query.SortByValue == 3) {
        var dh = { feesPerCunsaltation: -1 };
      } else {
        console.log("not found");
      }
      const doctors = await doctorModel.find({}).sort(dh);

      if (doctors.length === "") {
        return  res.status(201).send({
          apiStatus: true,
          message: " not found doctor to show",
        });
      }
      return  res.status(200).send({
        apiStatus: true,
        data: doctors,
        message: "doctors fetched success",
      });
    } catch (e) {
      return  res.status(500).send({
        apiStatus: true,
        data: e,
        message: e.message,
      });
    }
  };
  static getAllNotification = async (req, res) => {
    try {
      const user = await userModel.findOne({ _id: req.user._id });
      const seenNotification = user.seenNotification;
      const notification = user.Notification;
      seenNotification.push(...notification);
      user.Notification = [];




      const updatedUser = await user.save();
      return  res.status(200).send({
        apiStatus: true,
        data: updatedUser,
        message: "all notification marked as read",
      });
    } catch (e) {
      return  res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static notification = async(req,res)=>{
    try {
      const user = await userModel.findOne({ _id: req.user._id });
      if(!user){
        return  res.status(404).send({
          apiStatus: false,
          message: "invalid id",
        });
      }
      if(user){
        const notification = user.Notification;
        return  res.status(200).send({
          apiStatus: true,
          data: notification,
          message: "all notification marked as read",
        });
      }
    
    } catch (e) {
      return  res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  }
  static deleteAllNotification = async (req, res) => {
    try {
      const user = await userModel.findOne({ _id: req.body.userId });
      user.Notification = [];
      user.seenNotification = [];
      const updatedUser = await user.save();
      return res.status(200).send({
        apiStatus: true,
        data: updatedUser,
        message: "Notifications deleted successfully",
      });
    } catch (e) {
      return res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };

  static makeAppointment = async (req, res) => {
    try {
      const slot = await slotModel.findById(req.params.id);
      if (slot.isAvailable) {
        const newAppointment = await new appointmentModel({
          patientId: req.user._id,
          doctorId: slot.doctorId,
          slotId: req.params.id,
          phone: req.body.phone,
          address: req.body.address,
          PatientNote: req.body.PatientNote,
          patientName: req.body.patientName,
          status: "pending",
        });
        await newAppointment.save();

    let message = {
      to: req.user.token,
      notification: {
        title: `Doctor ${slot.doctorId.userId.name}`,
        body: ` your appointment has been pending`,
        sound: "default",
        click_action: "FCM_PLUGIN_ACTIVITY",
        icon: "fcm_push_icon",
      },
    };
    fcm.send(message, function (err, response) {
      if (err) {
        res.json({ status: 0, message: err });
        console.log("error : " + err);
      } else {
        console.log("MESSAGE SEND");
        res.json({ status: 1, message: response });
      }
    });
    let messageDoctor = {
      to: slot.doctorId.userId.token,
      notification: {
        title: "you have new request",
        body: `from ${req.user.name}`,
        sound: "default",
        click_action: "FCM_PLUGIN_ACTIVITY",
        icon: "fcm_push_icon",
      },
    };
    fcm.send(messageDoctor, function (err, response) {
      if (err) {
        res.json({ status: 0, message: err });
        console.log("error : " + err);
      } else {
        console.log("MESSAGE SEND");
        res.json({ status: 1, message: response });
      }
    });

        mailOptions = {
          from: '"Welcome to PHCP!" <sm6229639gmail.com>',
          to: req.user.email,
          subject: "Thank you for your appointment",
          html: `<h1 style='font-family: 'Proxima Nova',Helvetica,'Open Sans',Corbel,Arial,sans-serif;
          font-size: 17px;
          font-weight: bold;
          line-height: 1.24;
          letter-spacing: -0.1px;
          color: #4a4a4a;
          margin: 0; '>Ahlan ${req.user.name}</h1><p style='font-family: 'Proxima Nova',Helvetica,'Open Sans',Corbel,Arial,sans-serif;
          font-size: 13px;
          line-height: 1.62;
          color: #404553;
          letter-spacing: normal;'>Your Reservation with doctor ${slot.doctorId.userId.name} has been pending.</p>`,
        };
        slot.patientId = req.user._id;
        slot.isAvailable = false;
        await slot.save();
        mailTransport.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Mail has been sent :- ", info.response);
          }
        });
        req.user.Notification.push({
          type: "Reservation done",
          message: `your reservation is pending`,
          data: {
            reservationId: newAppointment._id,
          },
        })
        slot.doctorId.userId.Notification.push({
          type: "new Reservation ",
          message: `new Reservation from ${req.user.name}`,
          data: {
            reservationId: newAppointment._id
          },
        })
        slot.doctorId.save();
        req.user.save();
        return  res.status(200).send({
          apiStatus: true,
          data: {
            patientName: newAppointment.patientName,
            patientPhone: newAppointment.phone,
            address: newAppointment.address,
            from: slot.from,
            to: slot.to,
          },
          message: "success",
        });
      } else {
        return  res.status(404).send({
          apiStatus: false,
          message: "slot is not available or not found",
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

  static getSlot = async (req, res) => {
    try {
      const id= new mongoose.Types.ObjectId(req.params.id)
      const slot = await slotModel.aggregate([
        {
          $match: {
            doctorId: id,
            dayDate: { $gt: new Date(Date.now()).toISOString().slice(0, 10) },
            isAvailable: true,
          },
        },
      ]);
      return  res.status(200).send({
        apiStatus: true,
        data: slot.map((e) => {
          return {
            startWeek: e.startWeek,
            endWeek: e.endWeek,
            day: e.dayDate,
            from: `${parseInt(e.from)}:${
              (e.from - parseInt(e.from)) * 60
            }`,
            to: `${parseInt(e.to)}:${
              (e.to - parseInt(e.to)) * 60
            }`
            ,
            id: e._id,
            doctorId: e.doctorId,
          };
        }),
        message: "success",
      });
    } catch (e) {
      return  res.status(500).send({
        apiStatus: false,
        data: e.message,
        message: "false",
      });
    }
  };

  static allAppointmentCurrent = async (req, res) => {
    try {
      const appointment = await appointmentModel.find({
        patientId: req.user._id,
      });
      const hj = appointment.filter((e) => {
        if (e.slotId.dayDate > new Date().toISOString().slice(0, 10)) {
          return e;
        }
      });
      if (req.headers["lan"] == "en") {
        return res.status(200).send({
          apiStatus: true,
          data: hj.map((doc) => {
            return {
              city: doc.doctorId.address.city,
              placeNumber: doc.doctorId.address.placeNumber,
              name: doc.doctorId.userId.name,
              doctorImg: doc.doctorId.userId.profilePicture,
              specialize: doc.doctorId.specializeId.name,
              time: `${parseInt(doc.slotId.from)}:${
                (doc.slotId.from - parseInt(doc.slotId.from)) * 60
              }`,
              rating: doc.doctorId.ratingAverage,
              day: doc.slotId.dayDate,
              status: doc.status,
              id: doc._id,
            };
          }),
        });
      } else if (req.headers["lan"] == "ar") {
        return  res.status(200).send({
          apiStatus: true,
          data: hj.map((doc) => {
            return {
              city: doc.doctorId.address.city_ar,
              placeNumber: doc.doctorId.address.placeNumber_ar,
              name: doc.doctorId.name_ar,
              doctorImg: doc.doctorId.userId.profilePicture,
              specialize: doc.doctorId.specializeId.name_ar,
              time: `${parseInt(doc.slotId.from)}:${
                (doc.slotId.from - parseInt(doc.slotId.from)) * 60
              }`,
              rating: doc.doctorId.ratingAverage,
              day: doc.slotId.dayDate,
              status: doc.status,
              id: doc._id,
            };
          }),
        });
      } else {
        return res.status(200).send({
          apiStatus: false,
          message: "must send language in headers",
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
  static previous = async (req, res) => {
    try {


      const appointment = await appointmentModel.find({
        patientId: req.user._id,
      });
      const hj = appointment.filter((e) => {
        if (e.slotId.dayDate < new Date().toISOString().slice(0, 10) && e.status == "accepted") {
          return e;
        }
      });
      if (req.headers["lan"] == "en") {
        return  res.status(200).send({
          apiStatus: true,
          data: hj.map((doc) => {
            return {
              city: doc.doctorId.address.city,
              placeNumber: doc.doctorId.address.placeNumber,
              name: doc.doctorId.userId.name,
              doctorImg: doc.doctorId.userId.profilePicture,
              specialize: doc.doctorId.specializeId.name,
              time: `${parseInt(doc.slotId.from)}:${
                (doc.slotId.from - parseInt(doc.slotId.from)) * 60
              }`,
              rating: doc.doctorId.ratingAverage,
              day: doc.slotId.dayDate,
              status: doc.status,
              id: doc._id,
            };
          }),
        });
      } else if (req.headers["lan"] == "ar") {
        return  res.status(200).send({
          apiStatus: true,
          data: hj.map((doc) => {
            return {
              city: doc.doctorId.address.city_ar,
              placeNumber: doc.doctorId.address.placeNumber_ar,
              name: doc.doctorId.name_ar,
              doctorImg: doc.doctorId.userId.profilePicture,
              specialize: doc.doctorId.specializeId.name_ar,
              time: `${parseInt(doc.slotId.from)}:${
                (doc.slotId.from - parseInt(doc.slotId.from)) * 60
              }`,
              rating: doc.doctorId.ratingAverage,
              day: doc.slotId.dayDate,
              status: doc.status,
              id: doc._id,
            };
          }),
        });
      } else {
        return  res.status(200).send({
          apiStatus: false,
          message: "must send language in headers",
        });
      }
    } catch (e){
      return res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static contact_us = async (req, res) => {
    try {
      const msg = await new contactModel({
        patientName: req.body.patientName,
        email: req.body.email,
        patientNote: req.body.patientNote,
        patientId: req.user._id,
      });
      await msg.save();
      return  res.status(200).send({
        apiStatus: true,
        data: {
          patientName: msg.patientName,
          email: msg.email,
          patientNote: msg.patientNote,
        },
        message: "massage send successfully",
      });
    } catch (e) {
      return  res.status(200).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
}

module.exports = user;
