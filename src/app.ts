import express from "express";
import * as bodyParser from "body-parser";
import path from "path";
import {router} from "./routes/feed";
import {connect} from "mongoose";
import multer from "multer";
import {init} from "./socket";

const fileStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        callback(null, new Date().toISOString() + "-" + file.originalname)
    }
})

const fileFilter = (req: any, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
        callback(null, true)
    } else {
        callback(null, false)
    }
}

const app = express();
const http = require('http');

import 'dotenv/config'
import {authRouter} from "./routes/auth";

export const MONGODB_URI = process.env.MONGODB_URI || ''
// app.use(bodyParser.urlencoded({})) //x-www-form-url-endcoded

app.use(bodyParser.json()); //application/json
app.use(multer({storage: fileStorage, fileFilter}).single('image'))

app.use('/images', express.static(path.join(__dirname, '../images')));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next()
})
app.use('/feed', router);
app.use('/auth', authRouter);

//Error handler
app.use((error: any, req: any, res: any, next: any) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message: message, data: data});
});


connect(MONGODB_URI)
    .then((result) => {
        const server = http.createServer(app);
        //const server = app.listen(8080);
        const io = init(server);
        server.listen(8080)
        io.on('connection', (socket: any) => {
            console.log('Client connected');
        });

    })
    .catch(console.log)
