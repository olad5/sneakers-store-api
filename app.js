import express from 'express'
import 'express-async-errors';// package to catch async errors
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import logger from 'morgan'
import rateLimiter from 'express-rate-limit'
import helmet from 'helmet'
import xss from 'xss-clean'
import mongoSanitize from 'express-mongo-sanitize'
import compression from 'compression'
import hpp from 'hpp'
import errorHandlerMiddleware from './middleware/error-handler.js';
import notFoundMiddleware from './middleware/not-found.js';


// SWAGGER DOCS
import swaggerUI from 'swagger-ui-express'
import YAML from 'yamljs'
const swaggerDocument = YAML.load('./swagger.yaml');


import itemRouter from './routes/itemRoutes.js'
import userRouter from './routes/userRoutes.js'
import authRouter from './routes/authRoutes.js'
import cartRouter from './routes/cartRoutes.js'
import orderRouter from './routes/orderRoutes.js'
import checkoutRouter from './routes/checkoutRoutes.js'

// Start express app
const app = express()
dotenv.config()


app.use(logger('dev'))

// Limit requests from same API
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);

app.use(bodyParser.json({limit: '31mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '30mb', extended: true}))
app.use(helmet());// Set security HTTP headers
app.use(cors());// Implement CORS
app.use(xss()); // Data sanitization against XSS
app.use(mongoSanitize());// Data sanitization against NoSQL query injection

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(compression());

app.use(cookieParser(process.env.JWT_SECRET));


// Routers
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/items', itemRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/checkout', checkoutRouter);

app.use('*', (req, res) => {
  res.redirect('https://github.com/olad5/sneakers-store-api')
});

// Custom error handlers
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


export default app
