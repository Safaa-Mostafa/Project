const { mongoose } = require("mongoose");
const diagnosisSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxLength: 255,
      unique: true,
    },
    name_ar: {
      type: String,
      trim: true,
      maxLength: 255,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    img: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

const diagnosisModel = mongoose.model("diagnosis", diagnosisSchema);
module.exports = diagnosisModel;
