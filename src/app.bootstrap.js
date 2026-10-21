import { NODE_ENV, port } from '../config/config.service.js'
import { connectDB, connectRedis } from './DB/index.js'
import { authRouter } from './modules/auth/index.js' 
import { userRouter } from './modules/user/index.js'
import express from 'express'
import { globalErrorHandling } from './common/utils/response/error.response.js'
import { resolve} from 'node:path'
import { sendEmail } from './common/utils/index.js'
import { messageRouter } from './modules/index.js'
import cors from 'cors';
import helmet from 'helmet'
import geoip from 'geoip-lite'
import { RedisClient } from 'redis'
import { ipKeyGenerator, rateLimit } from 'express-rate-limit'

async function bootstrap() {
    const app = express()


  const Loginlimiter = rateLimit({
        windowMs:2*60*1000,
        limit: 3,
        legacyHeaders:true,
        standardHeaders:'draft-8',
        requestPropertyName:"rateLimit",
        skipFailedRequests:true,
        handler:(req,res,next)=>{
            return res.status(429).json({message: "Too many requests"})
        },
        keyGenerator:(req,res,next)=>{
            const ip = ipKeyGenerator (req.ip,56)
            console.log(`${ip}-${req.path}`);
            return `${ip}-${req.path}`
        },
        store: {
    async incr(key, cb) { // get called by keyGenerator
        try {
            const count = await redisClient.incr(key);
            if (count === 1) await redisClient.expire(key, 60); // 1 min TTL
            cb(null, count);
        } catch (err) {
            cb(err);
        }
    },

    async decrement(key) { // called by skipFailedRequests:true , skipSuccessfulRequests:true,
        if (await redisClient.exists(key)) {
            await redisClient.decr(key);
        }
    },
}

    })
    app.use(express.json())
    app.set("trust proxy" , true)
    app.use(cors() , helmet(), express.json())
   app.use("/uploads", express.static(resolve("../uploads")))
 
    await connectDB()
    await connectRedis()



    
    app.get('/', (req, res) => res.send('Hello World!'))
    
    app.use('/auth', authRouter) 
    app.use('/user', userRouter)
     app.use('/message', messageRouter)

    app.use(globalErrorHandling);
    app.use((req, res) => {
        return res.status(404).json({ message: "Invalid application routing" })
    })


    app.listen(port, () => console.log(`app listening on port ${port}!`))
}

export default bootstrap