import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, SYSTEM_ACCESS_TOKEN_SECRET_KEY, SYSTEM_REFRESH_TOKEN_SECRET_KEY, USER_ACCESS_TOKEN_SECRET_KEY , USER_REFRESH_TOKEN_SECRET_KEY } from "../../../../config/config.service.js";
import jwt from 'jsonwebtoken'
import { findOne } from "../../../DB/database.repository.js";
import { UserModel } from "../../../DB/index.js";
import { TokenTypeEnum , RoleEnum} from '../../enums/index.js'
import { BadRequestException , ConflictException, NotFoundException } from "../response/error.response.js";
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
    if (tokenType !== tokenApproach){
        throw ConflictException({message:`Unexpected token mechanism ${tokenType} while you have used ${tokenApproach} `})
    }
    const secret = await getTokenSignature ({tokenType: tokenApproach , level})
    const verifiedData = jwt.verify(token, secret);
    console.log(verifiedData)
    const user = await findOne({ model:UserModel, filter:{_id: verifiedData.sub} })
     if (!user) {
           throw NotFoundException({ message: 'Invalid credentials' });
       }
       return user
}

export const createLoginCredentials = async (user , issuer) => {
    
    const {accessSignature , refreshedSignature } = await detectSignaturesLevel(user.role)
  
    const access_token = await generateToken(
   {
           
            payload:{ sub: user._id, extra: 250 },
            secret: accessSignature,
          options:
            {
           issuer:'saraha' ,
           audience: [TokenTypeEnum.Access , user.role],
           expiresIn:ACCESS_TOKEN_EXPIRES_IN
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
           expiresIn:REFRESH_TOKEN_EXPIRES_IN
        }
       }
    )
       return {access_token , refresh_token ,}
   }
   
