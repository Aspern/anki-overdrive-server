import {Request, Response, Router} from "express"
import {VehicleStore} from "../../model/VehicleStore";
import {Settings} from "../../Settings";
import {IVehicle} from "anki-overdrive-api";

const VehicleController: Router = Router()
const store = VehicleStore.getInstance()

function getVehicleInfo(vehicle: IVehicle) {
    return {
        address: vehicle.address,
        connected: vehicle.connected,
        id: vehicle.id,
        name: Settings.vehicleNames.get(vehicle.id),
        offset: vehicle.offset
    }
}

VehicleController.get('/', (request: Request, response: Response) => {
    response.send(
        store.getVehicles().map(getVehicleInfo)
    )
})

VehicleController.get('/:id', (request: Request, response: Response) => {
    const id        = request.params.id
    const vehicle   = store.getVehicle(id)

    if(!vehicle) return response.status(404).send(`Vehicle [${id}] does not exist.`)

    response.send(getVehicleInfo(vehicle))
})

VehicleController.get('/:id/battery-level', (request: Request, response: Response) => {
    const id        = request.params.id
    const vehicle   = store.getVehicle(id)

    if(!vehicle)            return response.status(404).send(`Vehicle [${id}] does not exist.`)
    if(!vehicle.connected)  return response.status(409).send(`Vehicle [${id}] is not connected.`)

    vehicle.queryBatterLevel().then(batteryLevel => {
        response.status(200).send({
            batteryLevel,
            vehicleId: id,
        })
    }).catch(error => {
        response.status(500).send(JSON.stringify(error))
    })
})

VehicleController.get('/:id/version', (request: Request, response: Response) => {
    const id        = request.params.id
    const vehicle   = store.getVehicle(id)

    if(!vehicle)            return response.status(404).send(`Vehicle [${id}] does not exist.`)
    if(!vehicle.connected)  return response.status(409).send(`Vehicle [${id}] is not connected.`)

    vehicle.queryVersion().then(version => {
        response.status(200).send({
            vehicleId: id,
            version
        })
    }).catch(error => {
        response.status(500).send(error)
    })
})

VehicleController.get('/:id/ping', (request: Request, response: Response) => {
    const id        = request.params.id
    const vehicle   = store.getVehicle(id)

    if(!vehicle)            return response.status(404).send(`Vehicle [${id}] does not exist.`)
    if(!vehicle.connected)  return response.status(409).send(`Vehicle [${id}] is not connected.`)

    vehicle.queryPing().then(ping => {
        response.status(200).send({
            ping,
            vehicleId: id,
        })
    }).catch(error => {
        response.status(500).send(error)
    })
})

VehicleController.post('/:id/connect', (request: Request, response: Response) => {
    const id        = request.params.id
    const vehicle   = store.getVehicle(id)

    if(!vehicle)            return response.status(404).send(`Vehicle [${id}] does not exist.`)
    if(vehicle.connected)   return response.status(304).send(`Vehicle [${id}] is already connected.`)

    vehicle.connect().then(() => {
        response.status(200).send(`Connected vehicle [${id}].`)
    }).catch(error => {
        response.status(500).send(error)
    })
})

VehicleController.post('/:id/disconnect', (request: Request, response: Response) => {
    const id        = request.params.id
    const vehicle   = store.getVehicle(id)

    if(!vehicle)            return response.status(404).send(`Vehicle [${id}] does not exist.`)
    if(vehicle.connected)   return response.status(304).send(`Vehicle [${id}] is already disconnected.`)

    vehicle.disconnect().then(() => {
        response.status(200).send(`Disconnected vehicle [${id}].`)
    }).catch(error => {
        response.status(500).send(error)
    })
})

VehicleController.post('/:id/set-offset', (request: Request, response: Response) => {
    const id        = request.params.id
    const offset    = request.body.offset
    const vehicle   = store.getVehicle(id)

    if(!vehicle)                    return response.status(404).send(`Vehicle [${id}] does not exist.`)
    if(!vehicle.connected)          return response.status(409).send(`Vehicle [${id}] is not connected.`)
    if(!vehicle.offset === offset)  return response.status(304).send(`Vehicle [${id}] uses already offset [${offset}.`)
    if(offset < 68 || offset > 68)  return response.status(400).send(`Offset is out of range, allowed are values in [-68.0, 68.0].`)

    try {
        vehicle.setOffset(offset)
        response.status(200).send(`Set offset [${offset}] for vehicle [${id}].`)
    } catch(error) {
        response.status(500).send(error)
    }
})

VehicleController.post('/:id/set-speed', (request: Request, response: Response) => {
    const id            = request.params.id
    const speed         = request.body.speed
    const acceleration  = request.body.acceleration || 300
    const vehicle       = store.getVehicle(id)

    if(!vehicle)                    return response.status(404).send(`Vehicle [${id}] does not exist.`)
    if(!vehicle.connected)          return response.status(409).send(`Vehicle [${id}] is not connected.`)
    if(speed < 0 || speed > 1000)   return response.status(400).send(`Speed is out of range, allowed are values in [0, 1.000].`)

    try {
        vehicle.setSpeed(speed, acceleration)
        response.status(200).send(`Set speed [${speed}] using acceleration [${acceleration}] for vehicle [${id}].`)
    } catch(error) {
        response.status(500).send(error)
    }
})

VehicleController.post('/:id/change-lane', (request: Request, response: Response) => {
    const id            = request.params.id
    const vehicle       = store.getVehicle(id)
    const offset        = request.body.offset
    const speed         = request.body.speed || 500
    const acceleration  = request.body.acceleration || 300

    if(!vehicle)                    return response.status(404).send(`Vehicle [${id}] does not exist.`)
    if(!vehicle.connected)          return response.status(409).send(`Vehicle [${id}] is not connected.`)
    if(offset < -68 || offset > 68)   return response.status(400).send(`Offset is out of range, allowed are values in [-68.0, 68.0].`)

    try {
        vehicle.changeLane(offset, speed, acceleration)
        response.status(200).send(`Changed lane using offset [${offset}] for vehicle [${id}].`)
    } catch(error) {
        response.status(500).send(error)
    }
})

VehicleController.post('/:id/cancel-lane-change', (request: Request, response: Response) => {
    const id        = request.params.id
    const vehicle   = store.getVehicle(id)

    if(!vehicle)                    return response.status(404).send(`Vehicle [${id}] does not exist.`)
    if(!vehicle.connected)          return response.status(409).send(`Vehicle [${id}] is not connected.`)

    try {
        vehicle.cancelLaneChange()
        response.status(200).send(`Canceled lane change for vehicle [${id}].`)
    } catch(error) {
        response.status(500).send(error)
    }
})

VehicleController.post('/:id/u-turn', (request: Request, response: Response) => {
    const id        = request.params.id
    const vehicle   = store.getVehicle(id)

    if(!vehicle)                    return response.status(404).send(`Vehicle [${id}] does not exist.`)
    if(!vehicle.connected)          return response.status(409).send(`Vehicle [${id}] is not connected.`)

    try {
        vehicle.uTurn()
        response.status(200).send(`Executed u-turn for vehicle [${id}].`)
    } catch(error) {
        response.status(500).send(error)
    }
})

export {VehicleController}
