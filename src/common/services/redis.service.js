import { redisClient } from "../../DB/index.js";



export const baseRevokeTokenKey = (userId) => {
return `RevokeToken::${userId.toString()}`
}

export const revokeTokenKey = (userId) => {
return `baseRevokeTokenKey::${userId}`
}

export const otpKey = ({email , subject = "confirmEmail"}) => {
return `OTP::User::${email}::${subject}`
}

export const maxAttemptOtpKey = ({email , subject = "confirmEmail"}) => {
return `OTP::User::${email}::${subject}::MaxTrial`
}
export const BlockOtpKey = ({email , subject = "confirmEmail"}) => {
return `${otpKey({email,subject})}::Block`
}


export const set = async ({
   key,
   value,
   ttl
} ={} )  =>{
    try { 
        let data = typeof value === 'string' ? value : JSON.stringify(value)
        return ttl ? await redisClient.set(key,data,{EX:ttl}) :await redisClient.set(key,data)
    } catch(error) {
        console.log(`fail in redis set operation${error}`);
    }
}


export const update = async ({
   key,
   value,
   ttl
} ={} )  =>{
    try { 
       if(!await redisClient.exists(key)) return 0;
       return await set ({key,value,ttl})
    } catch(error) {
        console.log(`fail in redis update operation${error}`);
    }
}


export const get = async (key) => {
 

    try { 
      try{
        return JSON.parse(await redisClient.get(key))
      } catch(error) {
        return await redisClient.get(key)
      }


    } catch(error) {
        console.log(`fail in redis get operation${error}`);
    }
}

export const ttl = async (key) => {
    try {
        return await redisClient.ttl(key)
    } catch (error) {
        console.log(`Fail in redis ttl operation ${error}`);
    }
}

export const exists = async (key) => {
    try {
        return await redisClient.exists(key)
    } catch (error) {
        console.log(`Fail in redis ttl operation ${error}`);
    }
}

export const expire = async ({ key, ttl } = {}) => {
    try {
        return await redisClient.expire(key, ttl)
    } catch (error) {
        console.log(`Fail in redis add-expire operation ${error}`);
    }
}

export const mGet = async (keys = []) => {
    try {
        if (!keys.length) return 0;
        return await redisClient.mGet(keys)
    } catch (error) {
        console.log(`Fail in redis Mget operation ${error}`);
    }
}

export const keys = async (prefix) => {
    try {
        return await redisClient.keys(`${prefix}*`)
    } catch (error) {
        console.log(`Fail in redis keys operation ${error}`);
    }
}

export const deleteKey = async (key) => {
    try {
        if (!key.length) return 0;
        return await redisClient.del(key)
    } catch (error) {
        console.log(`Fail in redis del operation ${error}`);
    }
}

export const incr = async (key) => {
    try {
        return await redisClient.incr(key)
    } catch (error) {
        console.log(`Fail in redis incr operation ${error}`);
    }
}