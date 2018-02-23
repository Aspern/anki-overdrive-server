import {Router} from "express"
import {VehicleController} from "./VehicleController";

const Controller:Router = Router()

Controller.use('/helloworld', VehicleController)

export {Controller}



