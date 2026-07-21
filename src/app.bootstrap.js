import { NODE_ENV, port } from '../config/config.service.js'
import { connectDB } from './DB/index.js'
import { authRouter } from './modules/auth/index.js' 
import { userRouter } from './modules/user/index.js'
import express from 'express'


async function bootstrap() {
    const app = express()


    app.use(express.json())

    
    await connectDB()

   
    app.get('/', (req, res) => res.send('Hello World!'))
    
    app.use('/auth', authRouter) 
    app.use('/user', userRouter)

    
    app.use((req, res) => {
        return res.status(404).json({ message: "Invalid application routing" })
    })


    app.listen(port, () => console.log(`app listening on port ${port}!`))
}

export default bootstrap