const { check } = require("express-validator");
const validatorMiddleWare = require("../../middleware/validatorMiddleWare");
module.exports.register = [
//   check("email").isEmail().not().isEmpty().withMessage("email is not valid"),
//   check("name")
//     .isString()
//     .trim()
//     .isLength({ min: 3 })
//     .not()
//     .isEmpty()
//     .withMessage("Only letters and digits allowed in username"), 
//     check("name_ar")
//     .isString()
//     .trim()
//     .isLength({ min: 3 })
//     .not()
//     .isEmpty()
//     .withMessage("Only letters and digits allowed in username"),
//   check("password", "Password is required")
//     .notEmpty()
//     .isLength({
//       min: 6,
//     })
//     .withMessage("Password must contain at least 6 characters")
//     .isLength({
//       max: 20,
//     })
//     .withMessage("Password can contain max 20 characters"),

//   check("phone")
//     .isLength({ min: 11, max: 11 })
//     .not()
//     .isEmpty()
//     .withMessage("phone is not valid "),

  validatorMiddleWare,
];

module.exports.deleteUser = [
  check("id")
    .isMongoId()
    .withMessage("user Id is not valid")
    .not()
    .isEmpty()
    .withMessage("user id  is required"),
  check("password", "Password is required").notEmpty(),
  validatorMiddleWare,
];
module.exports.updatePass = [
  check("oldPass", "Password is required").notEmpty(),
  check("password", "Password is required")
    .notEmpty()
    .isLength({
      min: 6,
    })
    .withMessage("Password must contain at least 6 characters")
    .isLength({
      max: 20,
    })
    .withMessage("Password can contain max 20 characters"),
  validatorMiddleWare,
];
