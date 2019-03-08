import {Request, Response, Router} from "express"
import {VehicleStore} from "../../model/VehicleStore"
import {LocalizationPositionUpdate} from "anki-overdrive-api/lib/message/v2c/LocalizationPositionUpdate";
import {Track} from "anki-overdrive-api/lib/track/Track";
import {Straight} from "anki-overdrive-api/lib/track/Straight";
import {Curve} from "anki-overdrive-api/lib/track/Curve";
import {IVehicleMessage} from "anki-overdrive-api/lib/message/IVehicleMessage";
import {LoggerFactory} from "../../common/Logging";
import {Settings} from "../../Settings";

const store = VehicleStore.getInstance()
const logger = LoggerFactory.getLogger()
const AntiCollisionController: Router = Router()
const lastPositionUpdateMessage = new Map<string, LocalizationPositionUpdate|null>([
    [Settings.skullId, null],
    [Settings.groundShockId, null]
])
const keyForCounterpart = new Map<string, string>([
    [Settings.skullId, Settings.groundShockId],
    [Settings.groundShockId, Settings.skullId]
])
const messageListeners = new Map<string, any>()
const track = new Track([
    new Straight(40),
    new Curve(17),
    new Curve(20),
    new Straight(39),
    new Straight(36),
    new Curve(18),
    new Curve(23)
])

function antiCollision(vehicleId: string, distance: number) {
    // const lastMessage = lastPositionUpdateMessage.get(vehicleId)
    const vehicle = store.getVehicle(vehicleId)

    if(vehicle && vehicleId === Settings.skullId && distance <= 2) {
        vehicle.setSpeed(390)
    } else if(vehicle && vehicleId === Settings.skullId) {
        vehicle.setSpeed(600)
    }
}

const messageListener = (message: IVehicleMessage) => {
    if(message instanceof LocalizationPositionUpdate) {
        try {
            const key = keyForCounterpart.get(message.vehicleId)
            if (key) {
                const m = lastPositionUpdateMessage.get(key)
                if (m) {
                    const distance = track.distance([message.roadPieceId, message.locationId], [m.roadPieceId, m.locationId])
                    message.setDistance(distance)
                    antiCollision(message.vehicleId, distance)
                }
            }
            lastPositionUpdateMessage.set(message.vehicleId, message)
        } catch (e) {
            logger.error(e)
        }
    }
}

AntiCollisionController.post('/', (request: Request, response: Response, next) => {
    const v1 = store.getVehicle(Settings.skullId)
    const v2 = store.getVehicle(Settings.groundShockId)

    if(!v1)             return response.status(404).send(`Vehicle [ed0c94216553] does not exist.`)
    if(!v2)             return response.status(404).send(`Vehicle [eb401ef0f82b] does not exist.`)
    if(!v1.connected)   return response.status(409).send(`Vehicle [ed0c94216553] is not connected.`)
    if(!v2.connected)   return response.status(409).send(`Vehicle [eb401ef0f82b] is not connected.`)

    messageListeners.set(Settings.skullId, messageListener.bind({}))
    messageListeners.set(Settings.groundShockId, messageListener.bind({}))

    v1.addListener(messageListeners.get(Settings.skullId))
    v2.addListener(messageListeners.get(Settings.groundShockId))

    try {
       v1.setSpeed(600)
       setTimeout(() => {
           v1.setOffset(68)
           v2.setOffset(-68)
           v2.setSpeed(400)
       }, 2000)

       setTimeout(() => {
           v1.changeLane(68)
           v2.changeLane(68)
           response.status(200).send("Started Anti-Collision.")
       }, 4000)

    } catch (error) {
       response.status(500).send(error)
    }
})

AntiCollisionController.delete('/', (request: Request, response: Response) => {
    const v1 = store.getVehicle(Settings.skullId)
    const v2 = store.getVehicle(Settings.groundShockId)

    if(!v1)             return response.status(404).send(`Vehicle [ed0c94216553] does not exist.`)
    if(!v2)             return response.status(404).send(`Vehicle [eb401ef0f82b] does not exist.`)
    if(!v1.connected)   return response.status(409).send(`Vehicle [ed0c94216553] is not connected.`)
    if(!v2.connected)   return response.status(409).send(`Vehicle [eb401ef0f82b] is not connected.`)

    try {
       v1.removeListener(messageListeners.get(Settings.skullId))
       v2.removeListener(messageListeners.get(Settings.groundShockId))
       v1.setSpeed(0, 500)
       v2.setSpeed(0, 500)
       response.status(200).send(`Stopped Anti-Collision`)
    } catch (error) {
        response.status(500).send(error)
    }
})

export {AntiCollisionController}
