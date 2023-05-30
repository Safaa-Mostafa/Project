const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "user id is required"],
      ref: "user",
    },

    practiceLicense: {
      public_id: {
        type: String,
      },
      url: {
        type: String
      },
    },
   
      address: {
        city: String,
        city_ar: String,
        placeNumber: String,
        placeNumber_ar: String,
      },
    
    about: {
      type: String,
    },
    about_ar: {
      type: String,
    },
    website: {
      type: String,
    },
    img: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    experience: {
      type: String,
    },
    feesPerCunsaltation: {
      type: Number,
    },
    waitingTime: {
      type: String,
    },
  specializeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "specialize",
    },
    name: {
      type: String,
    },
    name_ar: {
      type: String,
    },

    ratingAverage: {
      type: Number,
      min: [1, "Rating must be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
      default:1
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    phone: {
      type: Number,
    },
    geolocation: {
      type: { type: String },
      coordinates: [Number],
  },
   
  },
  { timestamps: true ,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}}
);

doctorSchema.index({ "geolocation": "2dsphere" });
doctorSchema.pre(/^find/,function(next){
  this.populate({path:"userId",select:'profilePicture name phone status Notification token '});
this.populate({path:"specializeId",select:'name name_ar'})
  next();
  })
doctorSchema.virtual("reviews",{
  ref:'Review',
  foreignField:'doctorId',
  localField:'userId'

})
doctorSchema.virtual("specializeName",{
  ref:'specialize',
  foreignField:'_id',
  localField:'specializeId'

})
  const doctor = mongoose.model("doctor", doctorSchema);
module.exports = doctor;
