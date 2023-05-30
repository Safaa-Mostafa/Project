const mongoose = require('mongoose');

const durationSchema = new mongoose.Schema({
  doctorId: String,
weekId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "week",
},
  appointments: [
    {
      dayNo: Number,
      durations: [
        {
          from: Number,
          to: Number,
        },
      ],
    },
  ],
});

const duration = mongoose.model('durations', durationSchema);

module.exports = duration;