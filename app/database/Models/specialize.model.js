const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const specializeSchema = new mongoose.Schema(
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
specializeSchema.virtual("specialize", {
  ref: "specialize",
  localField: "_id",
  foreignField: "specializeId",
});

const specialize = mongoose.model("specialize", specializeSchema);
module.exports = specialize;
