const mongoose = require("mongoose");
const weekSchema = mongoose.Schema(
  {
    startWeek: {
      type: String,
      required: true,
    },
    endWeek: {
      type: String,
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "doctor id is required"],
      ref: "doctor",
    },
  },
  { timestamps: true }
);



const weekModel = mongoose.model("week", weekSchema);
module.exports = weekModel;
