const FCM = require("fcm-push");
const serverKey ="AAAA1UYUt-E:APA91bFbvp1s9-3c6MMwj_Bo6KEKDp5PxipRTHzso-sIImtbSeVkPzjgsAtTfDOnEW0nP0wBZnb8wMfh-3BUptSWORBmCvmEF7WQRjstAcFHCvydo_Xjrv2ozK7h9bo8Jl5NMIipK59z";
const userModel = require("../database/Models/user.model");
const doctorModel = require("../database/Models/doctor.model")
class notification {
  static addNotify = async (req, res) => {
  try{
    if(req.user.isPatient){
   
      const user = await userModel.findById(req.params.id)
      user.token = req.body.token
     await user.save();
   if(user){
     return   res.status(200).send({
      apiStatus:true,
      message:"token added success"
    })
   }else{
    return   res.status(500).send({
      apiStatus:false,
      message:"not found"
    })
   }

    }
   else if(req.user.isDoctor){
    const doctor = await doctorModel.findById(req.params.id)
    const fh = await userModel.findById(doctor.userId._id) 
    fh.token = req.body.token
  await fh.save();
  if(fh){
 return res.status(200).send({
    apiStatus:true,
    message:"token added success"
  })}
  else{
    return   res.status(500).send({
      apiStatus:false,
      message:"not found"
    })
   }
  
   }else{
    return res.status(404).send({
      apiStatus:false,
      message:"not found"
    })
   }
 
  }catch(e){
    res.status(500).send({
      apiStatus:false,
      message:e.message
    })
  }
    
}
}
module.exports = notification;
