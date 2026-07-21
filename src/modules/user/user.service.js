import { findOne } from "../../DB/database.repository.js"
import { UserModel } from "../../DB/index.js"
import {USER_ACCESS_TOKEN_SECRET_KEY} from "../../../config/config.service.js"
import jwt from "jsonwebtoken"
import { decodeToken } from "../../common/utils/security/token.security.js"
import { TokenTypeEnum } from "../../common/enums/security.enum.js"

export const profile = async(user) => {


    return user
}

export const rotateToken = async (user , issuer) =>
{    
    
    return createLoginCredentials(user , issuer)
}
