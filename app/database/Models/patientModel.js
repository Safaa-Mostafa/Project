const { mongoose } = require("mongoose");
const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "user id is required"],
      ref: "user",
    },
    profilePicture: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
        default:'https://res.cloudinary.com/dlivgib8n/image/upload/v1681133143/th_yjukuo.jpg'
      },
    },
    name: {
      type: String,
    },
    diagnosis: String,
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    phone:{
        type:Number
    },
  },
  { timestamps: true }
);
patientSchema.pre(/^find/,function(next){
  this.populate({path:"userId",select:'name'});
  next();
  })
const patientModel = mongoose.model("Patient", patientSchema);
module.exports = patientModel;
