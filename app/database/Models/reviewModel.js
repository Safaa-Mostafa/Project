const { updateLocale } = require("moment");
const mongoose = require("mongoose");
const doctorModel = require("./doctor.model")
const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: [1, "Min ratings value is 1.0"],
      max: [5, "Max ratings value is 5.0"],
    },
    patientId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: [true, "Review must belong to user "],
    },
    doctorId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: [true, "Review must belong to doctor"],
    },
  },
  { timestamps: true }
);
reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "patientId", select: "name" });
  next();
});
reviewSchema.statics.calcAvgRatingAndQuantity = async function (doctorTT) {
  const result = await this.aggregate([
    { $match: { doctorId: doctorTT } },
    {
      $group: {
        _id: "doctor",
        avgRatings: { $avg: "$rating" },
        ratingQuantity: { $sum: 1 },
      },
    },
  ]);
  const doctor = await doctorModel.findOne({_id:doctorTT})
if(result.length > 0){
doctor.ratingAverage = result[0].avgRatings,
doctor.ratingsQuantity = result[0].ratingQuantity
await doctor.save();
}else{
    doctor.ratingAverage = 0,
    doctor.ratingsQuantity = 0
    await doctor.save();
}
};
reviewSchema.post("save",async function(){
await this.constructor.calcAvgRatingAndQuantity(this.doctorId);
});
reviewSchema.post("remove",async function(){
  await this.constructor.calcAvgRatingAndQuantity(this.doctorId);
  });
module.exports = mongoose.model("Review", reviewSchema);
