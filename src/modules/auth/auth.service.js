import { UserModel , findOne, findOneAndUpdate, updateOne} from "../../DB/index.js"
import { ConflictException, NotFoundException , BadRequestException } from "../../common/utils/response/error.response.js"
import { generateEncryption , generateDecryption } from "../../common/utils/security/encryption.security.js";
import { generateHash, compareHash } from "../../common/utils/security/hash.security.js"; 
import {USER_ACCESS_TOKEN_SECRET_KEY , USER_REFRESH_TOKEN_SECRET_KEY} from "../../../config/config.service.js"
import jwt from 'jsonwebtoken'
import { createLoginCredentials } from "../../common/utils/security/token.security.js";
import { baseRevokeTokenKey, BlockOtpKey, deleteKey, get, incr, keys, maxAttemptOtpKey, otpKey, ttl } from "../../common/services/redis.service.js";
import { ProviderEnum } from "../../common/enums/user.enum.js";
//import { options } from "joi";
import { EmailEnum } from "../../common/enums/email.enum.js";
import { emailEvent , emailTemplate,sendEmail} from "../../common/utils/index.js";
import { createNumberOtp} from '../../common/utils/index.js';
import {set} from '../../common/services/redis.service.js'
import { model } from "mongoose";
import { revokeTokenKey } from "../user/user.service.js";



export const sendEmailOtp =async ({email, subject, title}={})=>{
      const isBlockedTTL = await ttl(BlockOtpKey({email,subject}))
    if (isBlockedTTL >0){
        throw BadRequestException({message:`cuurent otp  still active try again after ${isBlockedTTL}`})
    }
    const remainingOtpTTL = await  ttl(otpKey({email , subject}))
     if (remainingOtpTTL>0){
        throw BadRequestException({message:`cuurent otp  still active try again after ${remainingOtpTTL}`})
     }
     const maxTrial = await get(maxAttemptOtpKey({email,subject}))
     if(maxTrial>= 3) {
        await set ({
            key:BlockOtpKey({email, subject}),
            value: 1,
            ttl:7*60
        })
        throw BadRequestException({message:`you have reached the limit`})
     }
     const code = await createNumberOtp()
        await set({
            key: otpKey({email , subject}) , 
            value :await generateHash( `${code}`),
          ttl: 120
    });
       const key = otpKey({ email, subject });

     console.log("OTP KEY:", key);
     console.log("OTP TTL:", await ttl(key));
    console.log("OTP VALUE EXISTS:", Boolean(await get(key)));

       emailEvent.emit("sendEmail", async ()=>{
        await sendEmail({
            to:email,
            subject,
            html:emailTemplate({code,title})
        })
        
      
   await incr(maxAttemptOtpKey({email , subject}))
       })
        
}
export const signup = async (inputs) => {
    const {username, firstName, lastName, email, password, phone } = inputs;


    const checkUserExist = await UserModel.findOne({ email });
    if (checkUserExist) {
        throw ConflictException({ message: 'Email exist' });
    }

  
    const hashedPassword = await generateHash(password);
    const encryptedPhone = await generateEncryption(phone);

    console.log("DEBUG SIGNUP DATA:", { firstName, lastName, username });

  const user = await UserModel.create({
    firstName, 
    lastName, 
    email,
    password: hashedPassword,
    phone: encryptedPhone

    
});
 await sendEmailOtp({email,subject:EmailEnum.confirmEmail,title:"verify-email"})
    const userObj = user.toObject();
    delete userObj.password;

    return userObj;

  
}
export const confirmEmail = async (inputs) => {

    const { email, otp } = inputs;

  
    const account = await findOne({
        model: UserModel,
        filter: { email, confirmEmail: { $exists: false } , provider:ProviderEnum.System }
    })
    if (!account) {
        throw NotFoundException({ message: 'Fail to find matching account' })
    }
        

        
     const hashOtp = await get(otpKey({email , subject: EmailEnum.confirmEmail}))
     if (!hashOtp){
        throw NotFoundException({message:"Expired otp"})
     }
     console.log("OTP FROM REQUEST:", otp);
console.log("HASH FROM REDIS:", hashOtp);
     if (!await compareHash(`${otp}`, hashOtp)) {
    throw ConflictException({
        message: "invalid otp"
    });
}
      account.confirmEmail = new Date();
     await account.save()

     await deleteKey(await keys(otpKey({email , subject:EmailEnum.confirmEmail})))
     return ;

    }

    export const resendConfirmEmail = async (inputs) => {

    const { email } = inputs;

    const account = await findOne({
        model: UserModel,
        filter: { email, confirmEmail: { $exists: false }, provider: ProviderEnum.System }
    })
    if (!account) {
        throw NotFoundException({ message: "Fail to find matching account" })
    }
   
    await sendEmailOtp({email, subject:EmailEnum.confirmEmail,title:"verify-email"})

    
    return;
}


    
    export const login = async (inputs) => {
    const { email, password } = inputs;

    
    const user = await UserModel.findOne({ 
        model:UserModel,
        filter:{email,provider:ProviderEnum.System,confirmEmail:{$exists:true}},
        options:{

        }
       });
    if (!user) {
        throw NotFoundException({ message: 'Invalid credentials' });
    }

    
    const isPasswordMatch = await compareHash(password, user.password);
    if (!isPasswordMatch) {
        throw BadRequestException({ message: 'Invalid credentials' });
    }


    const userObj = user.toObject();
    delete userObj.password; 

    if (userObj.phone) {
        userObj.phone = await generateDecryption(userObj.phone); 
    }
    console.log("SECRET KEY IN LOGIN:", USER_ACCESS_TOKEN_SECRET_KEY);


    const issuer = process.env.ISSUER || 'SarahaApp';
    
    return createLoginCredentials(user , issuer)
   } 

   export const requestForgotPasswordOtp = async (inputs) => {

    const { email } = inputs;

    const account = await findOne({
        model: UserModel,
        filter: {
            email,
            confirmEmail: { $exists: true },
            provider: ProviderEnum.System
        }
    })
    if (!account) {
        throw NotFoundException({ message: "Fail to find matching account" })
    }

    await sendEmailOtp({ email, subject: EmailEnum.ForgotPassword, title: "Reset Code" })

    return;
}

 export const verifyForgotPasswordOtp = async (inputs) => {

    const { email, otp } = inputs;

    const hashOtp = await get(otpKey({ email, subject: EmailEnum.ForgotPassword }))
    if (!hashOtp) {
        throw NotFoundException({ message: "Expired otp" })
    }
    if (!await compareHash({ plaintext: otp, cipherText: hashOtp })) {
        throw ConflictException({ message: "Invalid otp" })
    }

    return;
}

 export const resetForgotPasswordOtp = async (inputs) => {

    const { email, otp ,password} = inputs;

    await verifyForgotPasswordOtp({email,otp})
    const user = await  findOneAndUpdate({
        model:UserModel,
        filter:{
            email,
            confirmEmail:{$exists:true},
            provider:ProviderEnum
        },
        update:{
            password:await generateHash({password}),
            changeCredentialTime:new Date()
        }
    })
    if (!user.isPasswordMatch){
        throw NotFoundException({message:"accound not exist"})
    }

    const tokenKeys =await keys(baseRevokeTokenKey(user._id))
    const otpkeys = await keys(otpKey({email , subject:EmailEnum.ForgetPassword}))
    await deleteKey ([...tokenKeys ,...otpKey])
    return;
}
