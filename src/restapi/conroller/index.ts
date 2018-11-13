import {Router} from "express"
import {VehicleController} from "./VehicleController"
import {AntiCollisionController} from "./AntiCollisionController"

const Controller: Router = Router()

Controller.use('/api/vehicle', VehicleController)
Controller.use('/api/anti-collision', AntiCollisionController)

export {Controller}
