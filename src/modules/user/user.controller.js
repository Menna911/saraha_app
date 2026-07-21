import { Router } from "express";
import { profile, rotateToken } from "./user.service.js";
import { succesResponse } from "../../common/utils/response/index.js";
import { authentication, authorization } from "../../middleware/authentication.middleware.js";
import { TokenTypeEnum } from "../../common/enums/security.enum.js";
import { RoleEnum } from "../../common/enums/user.enum.js";
import { endpoint } from "./user.authorization.js";
const router =Router()

router.get("/profile"  ,
    authentication(),
    authorization(endpoint.profile),
     async(req,res,next)=> {
const account = await profile(req.user)

return succesResponse({res, data:{account}})
})


router.get("/rotate-token" , 
    authentication(TokenTypeEnum.Refresh),
    async(req , res , next) =>{
        const credentials = await rotateToken(req.user , `${req.protocol}://${req.host}`);
        return succesResponse({ res , data: {credentials}})
    }
)
export default router