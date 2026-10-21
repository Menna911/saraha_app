import Joi from "joi";
import { generalValidationFields } from "../../common/utils/index.js";

export const login = {
    body: Joi.object().keys({
    email: generalValidationFields.email.required(),
    password: generalValidationFields.password.required(),
}).required()}
export const signup = {
    body: login.body.append().keys({
    username: generalValidationFields.username.required().messages({
        "any.required":"username is required",
        "string.empty":"username cannot be empty"
    }),
    phone: generalValidationFields.phone.required(),
    confirmPassword:generalValidationFields.confirmPassword("password").required(),
    firstName: generalValidationFields.firstName.required(),
    lastName: generalValidationFields.lastName.required(),
}).required(),

}
 export const resendConfirmEmail ={
    body: Joi.object().keys({
        email:generalValidationFields.email.required()
 }).required()
 }

export const confirmEmail ={
    body: resendConfirmEmail.body.append({
        email:generalValidationFields.email.required(),
        otp:generalValidationFields.otp.required()

    }).required(),
}
 
export const resetForgotPasswordCode = {
    body: confirmEmail.body.append({
        password: generalValidationFields.password.required(),
        confirmPassword: generalValidationFields.confirmPassword("password").required(),
    }).required()
}
