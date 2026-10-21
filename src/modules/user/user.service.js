import { deleteMany, findOne } from "../../DB/database.repository.js"
import { UserModel } from "../../DB/index.js"
import {ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, USER_ACCESS_TOKEN_SECRET_KEY} from "../../../config/config.service.js"
import jwt from "jsonwebtoken"
import { decodeToken } from "../../common/utils/security/token.security.js"
import { LogoutEnum, TokenTypeEnum } from "../../common/enums/security.enum.js"
import { ConflictException, generateDecryption, NotFoundException, succesResponse } from "../../common/utils/index.js"
import { tokenModel } from "../../DB/model/token.model.js"
import { destroyFile, uploadFile } from "../../common/utils/multer/cloudinary.js"
import { baseRevokeTokenKey } from "../../common/services/redis.service.js"
//import { options } from "joi"

 const createRevokeToken = async ({ userId , jti ,ttl}) =>{
    await set({
                key:revokeTokenKey({userId:sub,jti}),
                value: jti,
                ttl: iat + REFRESH_TOKEN_EXPIRES_IN
               
            }) 
            return;
 }

export const revokeTokenKey = ({userId,jti}) =>{
    return `RevokeToken::${userId}::${jti}`
}


export const logout = async ({flag}, user, {jti,iat}) =>{
    let status = 200
    switch (flag)
    {
       case LogoutEnum.ALL:
         user.changeCredentialTime = new Date() 
         await user.save()

         await deleteKey(await keys(baseRevokeTokenKey(sub )))
         break;
         default:
            await set({
                key:revokeTokenKey({userId:sub,jti}),
                value: jti,
                ttl: iat + REFRESH_TOKEN_EXPIRES_IN

                
            })
        status = 201
        break;
        
        }


        return status
        }

export const profileImage = async (req, res, next) => {

    const { secure_url, public_id } = await uploadFile({
        file: req.file,
        path: `user/${req.user._id}`
    })

    const user = await DBService.findOneAndUpdate({
        model: UserModel,
        filter: {
            _id: req.user._id
        },
        data: {
            picture: { secure_url, public_id }
        },
        options: {
            new: false
        }
    })

    if (user?.picture?.public_id) {
        await destroyFile(user.picture.public_id)
    }

    return successResponse({ res, data: { user } })
}


export const profileCoverImage = async (req, res, next) => {

    const attachments = await uploadFiles({
        files: req.files,
        path: `user/${req.user._id}/cover`
    })

    const user = await DBService.findOneAndUpdate({
        model: UserModel,
        filter: {
            _id: req.user._id
        },
        data: {
            cover: attachments
        },
        options: {
            new: false
        }
    })

    if (user?.cover?.length) {
        await deleteResources({
            public_ids: user.cover.map(ele => ele.public_id)
        })
    }

    return successResponse({ res, data: { user } })
}


export const shareProfile = async (userId) =>{
    const account = await findOne({model:UserModel , filter:{_id:userId , select:"-password"}});
    if (!account){
        throw NotFoundException({message:"Invalid shared account"})
    }
    if (account.phone){
        account.phone = await generateDecryption(account.phone)
    }
    return account
}
export const profile = async (user) => {

    const account = await UserModel.findById(user._id);

    if (!account) {
        throw NotFoundException({ message: "User not found" });
    }

    const accountObj = account.toObject();

    delete accountObj.password;

    if (accountObj.phone) {
        accountObj.phone = await generateDecryption(accountObj.phone);
    }

    return accountObj;
};

export const rotateToken = async (user , {sub,jti,iat}, issuer) =>
{    

     await createRevokeToken({
        userId:sub,
        jti,
        ttl:iat + REFRESH_TOKEN_EXPIRES_IN
     })
     
    return createLoginCredentials(user , issuer)
}


export const deleteAccount = 
async (req, res, next) => {

    const { userId } = req.params;

    const user = await DBService.deleteOne({
        model: UserModel,
        filter: {
            _id: userId,
            deletedAt: { $exists: true }
        },
    })
    if (user.deletedCount) {
        await deleteFolderByPrefix({ prefix: `user/${userId}` })
    }
    return user.deletedCount ? successResponse({ res, data: { user } }) : next(new Error("In-valid account", { cause: 404 }))
}

export const updatePassword = async ({ oldPassword, password }, user, issuer) => {

    if (!await compareHash({ plaintext: oldPassword, cipherText: user.password })) {
        throw ConflictException({ message: "invalid old password" })
    }


    for (const hash of user.oldPassword || []) {
         if (!await compareHash({ plaintext: oldPassword, cipherText: user.password })) {
        throw ConflictException({ message: "this password is already used before" })
        
    }
    user.oldPassword.push(user.password)
    user.password = await generateHash({ plaintext: password });
    user.changeCredentialsTime = new Date();
    await user.save();
    console.log(await keys(baseRevokeTokenKey(user._id)));

    await deleteKey(await keys(baseRevokeTokenKey(user._id)))
    return await createLoginCredentials(user, issuer);

}

}