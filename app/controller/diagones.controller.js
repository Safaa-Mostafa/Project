const diagnosisModel = require("../database/Models/diseaseModel");
const ApiError = require("../../utils/ApiError");
const cloudinary = require("../../middleware/cloudinary");
class diagnosis {
  static addDiagnosis = async (req, res) => {
    try {
      if (req.user.isAdmin) {
        const existingDiagnosis = await diagnosisModel.findOne({
          name: req.body.name,
        });
        if (existingDiagnosis) {
          return res
            .status(200)
            .send({ apiStatus: true, message: "diagnosis Already exist" });
        }
        const diagnosis = new diagnosisModel({ ...req.body });
        if (req.file) {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "DiagnosisImgs",
            width: 300,
            crop: "scale",
          });
          diagnosis.img = {
            public_id: result.public_id,
            url: result.secure_url,
          };
        }
        await diagnosis.save();
        return res.status(203).send({
          apiStatus: true,
          data: { diagnosis },
          message: "diagnosis added successfully",
        });
      } else {
        return res
          .status(403)
          .send({ apiStatus: false, message: "non authorized" });
      }
    } catch (E) {
      return res.status(500).send({ apiStatus: false, message: E.message });
    }
  };
  static editDiagnosis = async (req, res, next) => {
    try {
      if (req.user.isAdmin) {
        const Diagnosis = await diagnosisModel.findById(req.params.id);
        Diagnosis.name = req.body.name;
        if(req.file){
        if (Diagnosis.public_id)
          await cloudinary.uploader.destroy(
            Diagnosis.img.public_id,
            function (result) {
              console.log(result);
            }
          );
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "userImages",
          width: 300,
          crop: "scale",
        });
        Diagnosis.img = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }
        await Diagnosis.save();
        res.status(200).send({
          apiStatus: true,
          data: Diagnosis,
          message: "Diagnosis edited successfully",
        });
      } else {
        res.status(200).send({
          apiStatus: true,
          message: "you are not an admin",
        });
      }
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static deleteDiagnosis = async (req, res, next) => {
    try {
      if (req.user.isAdmin) {
        const Diagnosis = await diagnosisModel.findByIdAndDelete(
          req.params.id
        );
        if (!Diagnosis) {
          return next(
            new ApiError(`No Diagnosis for this id${req.params.id}`, 404)
          );
        }
        if (Diagnosis.public_id)
          await cloudinary.uploader.destroy(Diagnosis.img.public_id);

        res.status(200).send({
          apiStatus: true,
          data: Diagnosis,
          message: "deleted successfully",
        });
      } else {
        res.status(200).send({
          apiStatus: true,
          message: "you are not an admin",
        });
      }
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
  static all = async (req, res) => {
    try {
      const Diagnosis = await diagnosisModel.find({});
      res.status(200).send({
        apiStatus: true,
        data: Diagnosis,
        message: "all Diagnosis fetched success",
      });
    } catch (e) {
      res.status(500).send({
        apiStatus: false,
        data: e,
        message: e.message,
      });
    }
  };
}
module.exports = diagnosis;
