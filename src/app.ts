import express from "express";
import * as bodyParser from "body-parser";
import path from "path";
import {router} from "./routes/feed";
import {connect} from "mongoose";
const app = express();
import 'dotenv/config'
export const MONGODB_URI = process.env.MONGODB_URI|| ''
// app.use(bodyParser.urlencoded({})) //x-www-form-url-endcoded

app.use(bodyParser.json()); //application/json
app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PARCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next()
})
app.use('/feed', router);


connect(MONGODB_URI)
    .then((result) => {
        app.listen(3000);
    })
    .catch(console.log)
app.listen(8080);