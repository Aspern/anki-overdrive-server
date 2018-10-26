import {Request, Response, Router} from "express"
import {VehicleStore} from "../../model/VehicleStore";
import {Settings} from "../../Settings";

const VehicleController: Router = Router()
const store = VehicleStore.getInstance()

VehicleController.get('/', (request: Request, response: Response) => {
    response.send(
        store.getVehicles().map(vehicle => {
            return {
                address: vehicle.address,
                connected: vehicle.connected,
                id: vehicle.id,
                name: Settings.vehicleNames.get(vehicle.id),
                offset: vehicle.offset
            }
        })
    )
})

VehicleController.get('/:id', (request: Request, response: Response) => {
    const id = request.params.id
    const vehicle = store.getVehicle(id)

    if(!vehicle) {
        return response.sendStatus(404)
    }

    response.send({
        address: vehicle.address,
        id: vehicle.id,
    })
})

VehicleController.post('/:id/connect', (request: Request, response: Response) => {
    const id = request.params.id
    const vehicle = store.getVehicle(id)

    if(!vehicle) {
        return response.sendStatus(404)
    }

    if(vehicle.connected) {
        return response.sendStatus(304)
    }

    vehicle.connect().then(() => {
        response.sendStatus(200)
    }).catch(error => {
        response.sendStatus(500)
            .send(error.toLocaleString())
    })
})

VehicleController.post('/:id/disconnect', (request: Request, response: Response) => {
    const id = request.params.id
    const vehicle = store.getVehicle(id)

    if(!vehicle) {
        return response.sendStatus(404)
    }

    if(!vehicle.connected) {
        return response.sendStatus(304)
    }

    vehicle.disconnect().then(() => {
        response.sendStatus(200)
    }).catch(error => {
        response.sendStatus(500)
            .send(error.toLocaleString())
    })
})

VehicleController.post('/:id/set-offset', (request: Request, response: Response) => {
    const id = request.params.id
    const offset = request.body.offset
    const vehicle = store.getVehicle(id)

    if(!vehicle) {
        return response.sendStatus(404)
    }

    if(!vehicle.connected) {
        return response.sendStatus(304)
    }
    try {
        vehicle.setOffset(offset)
        response.sendStatus(200)
    } catch(error) {
        response.sendStatus(500)
            .send(error.toLocaleString())
    }
})

VehicleController.post('/:id/set-speed', (request: Request, response: Response) => {
    const id = request.params.id
    const speed = request.body.speed
    const vehicle = store.getVehicle(id)

    if(!vehicle) {
        return response.sendStatus(404)
    }

    if(!vehicle.connected) {
        return response.sendStatus(304)
    }
    try {
        vehicle.setSpeed(speed)
        response.sendStatus(200)
    } catch(error) {
        response.sendStatus(500)
            .send(error.toLocaleString())
    }
})

VehicleController.post('/:id/cancel-lane-change', (request: Request, response: Response) => {
    const id = request.params.id
    const vehicle = store.getVehicle(id)

    if(!vehicle) {
        return response.sendStatus(404)
    }

    if(!vehicle.connected) {
        return response.sendStatus(500).send("Vehicle is not connected.")
    }

    vehicle.cancelLaneChange()
    response.sendStatus(200)
})

VehicleController.post('/:id/change-lane', (request: Request, response: Response) => {
    const id = request.params.id
    const vehicle = store.getVehicle(id)
    const offset = request.body.offset
    const speed = request.body.speed || 500
    const acceleration = request.body.acceleration || 300

    if(!vehicle) {
        return response.sendStatus(404)
    }

    if(!offset) {
        return response.sendStatus(400)
            .send("Offset is required")
    }

    if(!vehicle.connected) {
        return response.sendStatus(500)
            .send("Vehicle is not connected.")
    }

    vehicle.changeLane(
        offset,
        speed,
        acceleration
    )
    response.sendStatus(200)
})

export {VehicleController}
