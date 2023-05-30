const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "doctor",
    },
    PatientNote: {
      type: String,
    },
    patientName: {
      type: String
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "slot",
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true ,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}}
);

appointmentSchema.virtual("specializeName",{
  ref:'doctor',
  foreignField:'userId',
  localField:'doctorId'

})
appointmentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "slotId",
    select: " from dayDate ",
  });
  this.populate({ 
    path: "doctorId",
  select: "userId address  specializeId ratingAverage name_ar ratingsQuantity "})
  this.populate({ 
    path: "patientId",
  select: "name email Notification _id "})
 

  next();
});
appointmentSchema.virtual("reviews",{
  ref:'Review',
  foreignField:'doctorId',
  localField:'doctorId'

})
const appointmentModel = mongoose.model("appointment", appointmentSchema);
module.exports = appointmentModel;
