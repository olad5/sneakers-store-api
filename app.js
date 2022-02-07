import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import logger from 'morgan'
import itemRouter from './routes/itemRoutes.js'
import userRouter from './routes/userRoutes.js'
import authRouter from './routes/authRoutes.js'
import cartRouter from './routes/cartRoutes.js'
import orderRouter from './routes/orderRoutes.js'


const app = express()
dotenv.config()
app.use(logger('dev'))

app.use(bodyParser.json({limit: '30mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '30mb', extended: true}))
app.use(cors())
app.use(cookieParser(process.env.JWT_SECRET));


// Routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/items', itemRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);

export default app
