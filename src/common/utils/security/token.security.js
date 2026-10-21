import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, SYSTEM_ACCESS_TOKEN_SECRET_KEY, SYSTEM_REFRESH_TOKEN_SECRET_KEY, USER_ACCESS_TOKEN_SECRET_KEY , USER_REFRESH_TOKEN_SECRET_KEY } from "../../../../config/config.service.js";
import jwt from 'jsonwebtoken'
import { findOne } from "../../../DB/database.repository.js";
import { UserModel } from "../../../DB/index.js";
import { TokenTypeEnum , RoleEnum} from '../../enums/index.js'
import { BadRequestException , ConflictException, NotFoundException, UnauthorizedException } from "../response/error.response.js";
import {randomUUID} from 'node:crypto'
import { tokenModel } from "../../../DB/model/token.model.js";
import { get } from "../../services/redis.service.js";
import { revokeTokenKey } from "../../../modules/user/user.service.js";
export const generateToken = async({payload ={} , secret = USER_ACCESS_TOKEN_SECRET_KEY , options = {}}) =>{
    return jwt.sign(payload , secret ,options)
}
 
export const verifyToken = async({token  ={} , secret = USER_ACCESS_TOKEN_SECRET_KEY } = {}) =>{
    return jwt.verify(token , secret )
}
 
export const detectSignaturesLevel = async(level) =>{
    let signature = {accessSignature: undefined , refreshedSignature: undefined};
    switch (level) {
        case RoleEnum.Admin:
            signature = {accessSignature: SYSTEM_ACCESS_TOKEN_SECRET_KEY, refreshedSignature: SYSTEM_REFRESH_TOKEN_SECRET_KEY};
            break
        default:
            signature = {accessSignature:USER_ACCESS_TOKEN_SECRET_KEY, refreshedSignature:USER_REFRESH_TOKEN_SECRET_KEY}
                break;
    }
    console.log({signature})
    return signature
}

export const getTokenSignature = async({ tokenType = TokenTypeEnum.Access , level} ={}) =>{
    const {accessSignature , refreshedSignature} = await detectSignaturesLevel(level)
    let signature = undefined;
    switch (tokenType) {
        case TokenTypeEnum.Refresh:
            signature = refreshedSignature
            break
        default:
            signature = accessSignature
                break;
    }
    return signature
}
export const decodeToken = async ({token , tokenType=TokenTypeEnum.Access } ={}) => {

const decoded = jwt.decode(token);
    console.log ({decoded});
    if (!decoded?.aud?.length) {
      throw BadRequestException({message: "Missing token audience"})
}

    const [tokenApproach , level] = decoded.aud || [] ;
    console.log({tokenApproach});
  
if (tokenType !== tokenApproach) {
    throw  UnauthorizedException({
        message: "Invalid login session"
    });
}
    if (decoded.jti && await get(revokeTokenKey({userId:decoded.sub , jti:decoded.jti}))){
            throw UnauthorizedException({
        message: "Invalid login session"
    })
    }


    const secret = await getTokenSignature ({tokenType: tokenApproach , level})
    const verifiedData = jwt.verify(token, secret);
    console.log(verifiedData)
    const user = await findOne({ model:UserModel, filter:{_id: verifiedData.sub} })
     if (!user) {
           throw NotFoundException({ message: 'Invalid credentials' });
       }
       console.log({changeCredentialTime:user.changeCredentialTime?.getTime() , iat:decoded.iat});
       if(user.changeCredentialTime && user.changeCredentialTime?.getTime() >= decoded.iat *1000){
        throw NotFoundException({message:"Invalid login session"})
       }
         
       return {user , decoded}
}

export const createLoginCredentials = async (user , issuer) => {
    
    const {accessSignature , refreshedSignature } = await detectSignaturesLevel(user.role)
  
    const jwtid = randomUUID()
    const access_token = await generateToken(
   {
           
            payload:{ sub: user._id, extra: 250 },
            secret: accessSignature,
          options:
            {
           issuer:'saraha' ,
           audience: [TokenTypeEnum.Access , user.role],
           expiresIn:ACCESS_TOKEN_EXPIRES_IN,
           jwtid
        }
       }
    )
   
        const refresh_token = await generateToken(
   {
           
            payload:{ sub: user._id, extra: 250 },
            secret: refreshedSignature,
          options:
            {
           issuer:'saraha' ,
           audience: [TokenTypeEnum.Refresh , user.role],
           expiresIn:REFRESH_TOKEN_EXPIRES_IN,
           jwtid
        }
       }
    )
       return {access_token , refresh_token ,}
   }
   
