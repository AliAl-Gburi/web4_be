import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { userRouter } from './routes/user-router';
import * as userModel from './model/user';
import { User } from './types';
import { messageRouter } from './routes/message-router';
import session from 'express-session';
import crypto from 'crypto';
import { getUser, getUsers } from './model/user';
import { Session } from 'inspector';

const store = new session.MemoryStore();

const app = express();
dotenv.config();
app.use(session({
        secret: 'trolololo',
        saveUninitialized:false,
        cookie: { maxAge: 1000*60*60*24},
        resave: false,
        store

}));

app.use(function (req, res, next)  {
    
    
    
    
    next()
})

const swaggerOpts = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API for StudentBook app',
            version: '1.0.0',
        },
    },
    apis: ['./routes/*.ts',]
};

const swaggerSpec = swaggerJSDoc(swaggerOpts);
var whitelist = ['http://localhost:8001', 'http://localhost:3000' ]
var corsOptions = {
    origin: function (origin, callback) {
        if(whitelist.indexOf(origin) !== -1 || true) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
    credentials: true
}

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/user', userRouter);
app.use('/messages', messageRouter);

app.get('/status', (req, res) => {
    res.json({ message: 'Backend is running...'});
});

app.get('/', (req, res) => {
    return res.status(200).send();
})







app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(process.env.APP_PORT, () => {
    console.log(`Server is running on port ${process.env.APP_PORT}.`);
})

export { session, store }

