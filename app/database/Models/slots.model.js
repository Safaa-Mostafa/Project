const mongoose = require("mongoose");
const slotSchema = mongoose.Schema(
  {
    weekId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "week id is required"],
      ref: "week",
    },
    from: {
      type: String,
    },
    to: {
      type: String,
    },
    dayDate: {
      type: String,
    },
    dayNo: { type: Number },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "doctor id is required"],
      ref: "doctor",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

slotSchema.pre(/^find/, function (next) {
  this.populate({
    path: "doctorId",
    select: "profilePicture name phone status",
  });
  this.populate({ path: "weekId", select: "startWeek endWeek" });
  next();
});
const slotModel = mongoose.model("slot", slotSchema);

module.exports = slotModel;
