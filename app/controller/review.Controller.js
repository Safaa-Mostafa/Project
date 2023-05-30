const reviewModel = require("../database/Models/reviewModel");

class review {
  static allReview = async (req, res) => {
    try {
        const reviews = await reviewModel.find()
       return res.status(200).send({
            apiStatus:true,
            data:reviews,
            message:"all reviews fetched success"
        })
    } catch (e) {
        return res.status(500).send({
            apiStatus:true,
            data:e,
            message:e.message
        })
    }
  };
  static addReview = async (req, res) => {
    try {
        if(req.user.id == req.body.patientId){
            const review = await new reviewModel(req.body);
        await review.save()
        return res.status(200).send({
            apiStatus:"true",
            data:review,
            message:"added review success"
        })}else{
            return res.status(200).send({
                apiStatus:"true",
                message:"not allowed"
            })
        }
    } catch (e) {
       return  res.status(500).send({
            apiStatus:"false",
            data:e,
            message:e.message
        })
    }
  };
  static editReview = async (req, res) => {
    try {
    const review = await  reviewModel.findById(req.params.id);
    if( req.body.rating){
    review.rating = req.body.rating
    }else{
      return   res.status(200).send({
            apiStatus:true,
            message:"not allowed"
        })
    }
    if(review.user)
        await review.save()

      return  res.status(200).send({
            apiStatus:"true",
            data:review,
            message:"edit review success"
        })
    } catch (e) {
      return  res.status(500).send({
            apiStatus:"false",
            data:e,
            message:e.message
        })
    }
  };
  static deleteReview = async(req,res)=>{
  try{ 
    const review = await reviewModel.findByIdAndDelete(req.params.id)
    await review.remove();
   return res.status(200).send({
        apiStatus:true,
        message:"review removed success"
    })
  }
  catch(e){
   return res.status(500).send({
        apiStatus:false,
        data:e,
        message:e.message
    })
  }
}
static single = async(req,res)=>{
    try{ 
        const review = await reviewModel.findById(req.params.id)
     return res.status(200).send({
          apiStatus:true,
          data:review
              })
    }
    catch(e){
    return  res.status(500).send({
          apiStatus:false,
          data:e,
          message:e.message
      })
    }
  }
}


module.exports = review;
