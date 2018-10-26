import {Application} from "express";
import {Controller} from "./conroller/index"
import * as express from "express"
import * as bodyParser from "body-parser"

const RestApi: Application = express()

RestApi.use(bodyParser.urlencoded({extended: true}))
RestApi.use(bodyParser.json())
RestApi.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})
RestApi.use(Controller)

export {RestApi}
