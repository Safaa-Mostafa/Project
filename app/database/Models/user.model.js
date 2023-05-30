const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "accept", "reject"],
    },
    Isverified: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isDoctor: {
      type: Boolean,
      default: false,
    },
    Notification: {
      type: Array,
      default: [],
    },
    seenNotification: {
      type: Array,
      default: [],
    },
    tokens: [
      {
        token: { type: String, required: true },
      },
    ],
    RandomNumber: {
      type: String,
      default: "",
    },
    phone: {
      type: Number,
    },
    uniqueString: {
      type: Number,
    },
    isPatient:{
      type: Boolean,
    },
    profilePicture: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
        default:'https://res.cloudinary.com/dlivgib8n/image/upload/v1681133143/th_yjukuo.jpg'

      },
    }
   ,
   token: { type: String },

  },
  { timestamps: true }
);


userSchema.methods.toJSON = function () {
  const userData = this.toObject();
  delete userData.__v;
  delete userData.password;
  delete userData.tokens;
  return userData;
};
userSchema.pre("save", async function () {
  const data = this;
  if (data.isModified("password")) {
    data.password = await bcrypt.hash(data.password, 12);
  }
});

userSchema.statics.checkPass = async (id, oldPass) => {
  const userData = await user.findById({ _id: id });
  if (!userData) throw new Error("user not found");
  const checkPass = await bcrypt.compare(oldPass, userData.password);
  if (!checkPass) throw new Error("invalid Password");
  return userData;
};

userSchema.statics.login = async (email, pass) => {
  const userData = await user.findOne({ email });
  if (!userData) throw new Error("invalid email");
  const checkPass = await bcrypt.compare(pass, userData.password);
  if (!checkPass) throw new Error("invalid Password");
  return userData;
};
userSchema.methods.generateToken = async function () {
  const user = this;
  if (user.tokens.length == 10) throw new Error("token exded");
  const token = jwt.sign({ _id: user._id }, "privateKey");
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.virtual("user", {
  ref: "user",
  localField: "_id",
  foreignField: "userId",
});
const user = mongoose.model("user", userSchema);
module.exports = user;
