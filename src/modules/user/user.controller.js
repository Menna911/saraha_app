import { Router } from "express";
import { profile, profileCoverImage, rotateToken , logout } from "./user.service.js";
import { succesResponse } from "../../common/utils/response/index.js";
import { authentication, authorization } from "../../middleware/authentication.middleware.js";
import { TokenTypeEnum } from "../../common/enums/security.enum.js";
import { RoleEnum } from "../../common/enums/user.enum.js";
import { endpoint } from "./user.authorization.js";
import * as validators from './user.validation.js'
import { validation } from "../../middleware/validation.middleware.js";
import { cloudFileUpload } from "../../common/utils/multer/cloud.multer.js";
const userRouter =Router()


userRouter.post("/logout" , authentication(), async(req,res,next) =>{
const status = await logout(req.body,req.user,req.decoded)
return succesResponse({res,status})
})

userRouter.patch(
    "/password",
    authentication(),
    validation(validators.updatePassword),
    async (req, res, next) => {
        const credentials = await updatePassword(req.body ,req.user , `${req.protocol}://${req.host}`)
        return successResponse({ res, data: { ...credentials } })
    })
userRouter.patch(
    "/profile-image",
    authentication(),
    cloudFileUpload({customPath:'users/profile'}).single("attachemnt"), async(req,res,next)=>{
      const account = await profileImage(req.file ,req.user )
        return succesResponse({res, data:{account}})
})

userRouter.patch(
    "/profile-cover-image",
    authentication(),
    cloudFileUpload({
        customPath: "users/profile/cover",
        maxSize: 5
    }).array("attachemnt", 5),
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

userRouter.get("/profile"  ,
    authentication(),
    authorization(endpoint.profile),
     async(req,res,next)=> {
const account = await profile(req.user)

return succesResponse({res, data:{account}})
})


userRouter.get (
    "/:userId/share-profile",
    validation(validators.shareProfile),
    async (req,res,next) =>{
        const account = await shareProfile (req.params.userId)
        return succesResponse ({res, data:{account}})
    }

) 

userRouter.post("/rotate-token" , 
    authentication(TokenTypeEnum.Refresh),
    async(req , res , next) =>{
        const credentials = await rotateToken(req.user , `${req.protocol}://${req.host}`);
        return succesResponse({ res , status:201 ,data: {credentials}})
    }
)
export default userRouter