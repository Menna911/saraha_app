import { randomUUID } from 'node:crypto'
import { resolve} from 'node:path'
import multer from 'multer'
import { existsSync,  mkdirSync } from 'node:fs'

export const cloudFileUpload = ({ validation=[] }={}) =>{
   const storage = multer.diskStorage({})
   
   function fileFilter(req,file,callback){
    console.log(file);
    if (validation.includes(file.mimetype)){
        return callback(null,true)
    }
    return callback("invalid file format" , false)
   }
    return multer ({fileFilter, storage})
}

export const fileFieldValidation = {
    image: {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp"
    }
};