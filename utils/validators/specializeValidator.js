const { check} = require('express-validator');
const validatorMiddleWare=require("../../middleware/validatorMiddleWare")
module.exports.addSpecializeValidator = [
check('userId').isMongoId().withMessage("user Id is not valid").not().isEmpty().withMessage('userId is required'),
check('name').isString().withMessage('Only letters and digits allowed in SpecializeName.')
.trim()
.isLength({min: 3}).withMessage('Specialize name too short!').not().isEmpty().withMessage('name is required'),

validatorMiddleWare,
]
module.exports.editSpecializeValidator = [
   check('id').isMongoId().withMessage("specialize Id is not valid").not().isEmpty().withMessage('specialize id  is required'),
    check('name').isString().withMessage('Only letters and digits allowed in SpecializeName.')
    .trim()
    .isLength({min: 3}).withMessage('Specialize name too short!').not().isEmpty().withMessage('name is required'),
    
    validatorMiddleWare,
    ]