import { Router } from "express";
import { login, signup ,confirmEmail, resendConfirmEmail, resetForgotPasswordOtp} from "./auth.service.js";
import { succesResponse } from "../../common/utils/response/success.response.js";
import { BadRequestException } from "../../common/utils/response/error.response.js";
import * as validators from './auth.validation.js'
import { validation } from "../../middleware/validation.middleware.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { profile ,shareProfile , profileCoverImage} from "../user/user.service.js";
import { profileImage as profileImageValidator } from "../user/user.validation.js";
import { profileImage as uploadProfileImage } from "../user/user.service.js";
import {
    profileCoverImage as profileCoverImageValidator
} from "../user/user.validation.js";
import { cloudFileUpload } from "../../common/utils/multer/cloud.multer.js";
import { generateHash, sendEmail } from "../../common/utils/index.js";
import { emailTemplate } from "../../common/utils/email/template.email.js";
import { createNumberOtp } from "../../common/utils/otp.js";
import { deleteKey, set } from "../../common/services/redis.service.js";
//import {Loginlimiter} from '../../middleware/rateLimiter.middleware.js';
const authRouter = Router();
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { redisClient } from '../../DB/index.js';

export const Loginlimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    limit: 3,
    legacyHeaders: true,
    standardHeaders: 'draft-8',
    requestPropertyName: "rateLimit",
    skipFailedRequests: true,

    handler: (req, res, next) => {
        return res.status(429).json({
            message: "Too many requests"
        });
    },

    keyGenerator: (req) => {
        const ip = ipKeyGenerator(req.ip, 56);
        console.log(`${ip}-${req.path}`);
        return `${ip}-${req.path}`;
    },

    store: {
        async incr(key, cb) {
            try {
                const count = await redisClient.incr(key);

                if (count === 1) {
                    await redisClient.expire(key, 120);
                }

                cb(null, count);
            } catch (err) {
                cb(err);
            }
        },

        async decrement(key) {
            if (await redisClient.exists(key)) {
                await redisClient.decr(key);
            }
        }
    }
});

authRouter.post("/logout" , authentication(), async(req,res,next) =>{
const account = await logout(req.user)
return succesResponse({res})
})

authRouter.patch(
    "/confirm-email",
    validation(validators.confirmEmail),
    async (req, res, next) => {

        await confirmEmail(req.body)
        return succesResponse({ res, status: 201 })

    })

    authRouter.patch(
    "/resendConfirm-Email",
    validation(validators.resendConfirmEmail),
    async (req, res, next) => {

        await resendConfirmEmail (req.body)
        return successResponse({ res, status: 201 })

    })

    authRouter.post(
    "/request-forgot-password-code",
    validation(validators.resendConfirmEmail),
    async (req, res, next) => {
        await requestForgotPasswordOtp(req.body)
        return successResponse({ res })
    })

authRouter.patch(
    "/verify-forgot-password-code",
    validation(validators.confirmEmail),
    async (req, res, next) => {
        await verifyForgotPasswordOtp(req.body)
        return successResponse({ res })
    })

    authRouter.patch(
    "/reset-forgot-password-code",
    validation(validators.resetForgotPasswordCode),
    async (req, res, next) => {
        await resetForgotPasswordOtp(req.body)
        return successResponse({ res })
    })


authRouter.patch(
    "/profile-image",
    authentication(),
    cloudFileUpload({
        customPath: "users/profile"
    }).single("attachemnt"),

    validation(profileImageValidator),

    async (req, res, next) => {
        const account = await uploadProfileImage(
            req.file,
            req.user
        );

        return succesResponse({
            res,
            data: { account }
        });
    }
);
authRouter.patch(
    "/profile-cover-image",
    authentication(),
    cloudFileUpload({
        customPath: "users/profile/cover",
        maxSize: 5
    }).array("attachemnt", 5),
    validation(profileCoverImageValidator),
    async (req, res, next) => {
        const account = await profileCoverImage(
            req.files,
            req.user
        );

        return succesResponse({
            res,
            data: { account }
        });
    }
);



authRouter.get (
    "/",
    authentication(),
    async (req,res,next) =>{
        const account = await profile (req.user)

        return succesResponse ({res, data:{account}})
    }

)

authRouter.get (
    "/:userId/share-profile",
    async (req,res,next) =>{
        const account = await shareProfile (req.params.userId)
        return succesResponse ({res, data:{account}})
    }

) 
authRouter.post("/signup",validation(validators.signup),async (req, res, next) => {
   
      const account = await signup(req.body);
        return succesResponse({ res, status: 201, data: { account } });
    
    });


authRouter.post("/login",Loginlimiter,validation(validators.login) ,async (req, res, next) => {
    try {
        const credentials = await login(req.body);
        await deleteKey(`${req.ip}-${req.path}`)
        return succesResponse({ res, status: 200, data: { credentials } }); 
    } catch (error) {
        next(error);
    }
});

export default authRouter;