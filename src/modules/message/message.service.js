import { model } from "mongoose"
import { findOne, findOneAndDelete, UserModel } from "../../DB/index.js"
import { confirmEmail } from "../auth/auth.service.js"
import { NotFoundException } from "../../common/utils/response/index.js"
import { MessageModel } from "../../DB/model/index.js"
import { Router } from "express"
const router = Router({caseSensitive: true, strict: true , mergeParams: true})

export const sendMessage =async (receiverId,{content = undefined} = {},files , user) =>{
    const account = await findOne({
        model: UserModel,
        filter:{_id:receiverId , confirmEmail:{$exists:true}}
    })
    if (!account){
        throw NotFoundException("fail to find matching receiver account")
    }
     const message = await createConnection({
        model:MessageModel,
        data:{
            content,
            attachments:files.map((file)=>file.finalPath),
            receiverId,
            senderId:user ? user._id : undefined
        }
     })
    return message
}

export const deleteMessage = async (messageId, user) => {
    const message = await findOneAndDelete({
        model: MessageModel,
        filter: {
            _id: messageId,
             receiverId :user._id 
            
        },
        select: "-senderId"
    })
    if (!message) {
        throw NotFoundException({ message: "Invalid message or not authorized action" })
    }
    return message
}

export const getMessages = async ( user) => {
    const message = await findOne({
        model: MessageModel,
        filter: {
            $or: [
                { senderId: user._id },
                { receiverId: user._id },
            ]
        },
        select: "-senderId"
    })
    
    return messages
}


export const getMessage = async (messageId, user) => {
    const message = await findOne({
        model: MessageModel,
        filter: {
            _id: messageId,
            $or: [
                { senderId: user._id },
                { receiverId: user._id },
            ]
        },
        select: "-senderId"
    })
    if (!message) {
        throw NotFoundException({ message: "Invalid message or not authorized action" })
    }
    return message
}
