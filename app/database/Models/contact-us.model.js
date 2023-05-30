const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    patientNote: {
      type: String,
    },
    patientId:{
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "user id is required"],
        ref: "user",
    }
  },
  { timestamp: true }
);

const contactModel = mongoose.model("contact", contactSchema);
module.exports = contactModel;
