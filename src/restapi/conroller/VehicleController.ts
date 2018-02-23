import {Request, Response, Router} from "express"

const VehicleController:Router = Router()

VehicleController.get('/:message', (request:Request, response:Response) => {
    const message = request.params.message

    return response.send("Hello, " + message)
})

export {VehicleController}


