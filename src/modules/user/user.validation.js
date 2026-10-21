import joi from 'joi'
import { generalValidationFields } from '../../common/utils/validation.js'
import {  fileFieldValidation} from '../../common/utils/multer/index.js'
import { validation } from "../../middleware/validation.middleware.js";
export const shareProfile  = {
    params:joi.object().keys({
       userId:generalValidationFields.id.required()
    }).required()
}


export const updatePassword = {
    body: joi.object().keys({
        oldPassword: generalValidationFields.password.required(),
        password: generalValidationFields.password.not(joi.ref("oldPassword")).required(),
        confirmPassword: generalValidationFields.confirmPassword("password").required(),
    }).required()
}


export const profileImage ={
file : generalValidationFields.file(fileFieldValidation.image).required()
    }
export const profileCoverImage = {
    files: joi.array()
        .items(
            generalValidationFields
                .file(fileFieldValidation.image)
        )
        .min(1)
        .max(5)
        .required()
        .messages({
            "any.required": "Profile cover image is required",
            "array.min": "At least one cover image is required",
            "array.max": "You can upload a maximum of 5 cover images"
        })
};