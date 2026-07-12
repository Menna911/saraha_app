import { UserModel } from "../../DB/index.js"
import { ConflictException, NotFoundException } from "../../common/enums/utils/response"
import { generateDecryption, generateEncryption } from "../../common/enums/utils/security/encryption.security.js";

export const signup = async (inputs) => {

    const { username , email, password, phone} = inputs;

    const checkUserExist = await UserModel.findOne({
         model:UserModel,
        filter: {email}  });
    if (checkUserExist) {
        throw ConflictException({message: 'Email exist'})
    
    }
  const user = await createOne({
    model:UserModel,
    data:{ username 
        , email,
         password,
         phone:await  generateEncryption(phone)
        }
  })
  return user
}

export const login = async (inputs) => {

    const {email, password} = inputs;

    const user = await UserModel.findOne({
        model:UserModel,
        filter:{ email, password },
        select: "-password",
        lean:false
    
    });
    if (!user) {
        throw NotFoundException({message: 'Invalid Credentials'})
    }

  return user
}