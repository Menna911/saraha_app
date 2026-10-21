import { TokenTypeEnum } from "../common/enums/index.js";
import { BadRequestException, ForbiddenException, UnauthorizedException } from "../common/utils/response/error.response.js";
import { decodeToken } from "../common/utils/security/token.security.js";

export const authentication = (token = TokenTypeEnum.Access) =>{

return async (req , res , next) => {
    const {authorization} = req.headers;
    console.log({authorization})
    const [schema , credentials] =req.headers.authorization?.split(" ")
    console.log({authorization , schema , credentials}) ;
     if (!schema || !credentials){
        throw UnauthorizedException ({message:"missing authentication key or invalid approach"})
     }
    switch (schema){
        case "Basic":
         const data = Buffer.from(credentials,'base64').toString()?.split(":") || [];
         console.log(data);
         break;
         case 'Bearer' :
            const {user , decoded} = await decodeToken ({token:credentials , tokenType:token})
            req.user = user;
            req.decoded =decoded;
            break;
            default :
            throw BadRequestException({message:"missing authentication schema"})
            break;
    }
    next()
}
}
export const authorization = (accessRoles = []) =>{
    return async (req , res , next) => {
        if (!accessRoles.includes(req.user.role)){
            throw ForbiddenException({message:"Not authorized account"})
        }
        next()
    }
}