import {Request, Response, Router} from "express"
import {VehicleStore} from "../../model/VehicleStore"
import {LocalizationPositionUpdate} from "anki-overdrive-api/lib/message/v2c/LocalizationPositionUpdate";
import {Track} from "anki-overdrive-api/lib/track/Track";
import {Straight} from "anki-overdrive-api/lib/track/Straight";
import {Curve} from "anki-overdrive-api/lib/track/Curve";
import {IVehicleMessage} from "anki-overdrive-api/lib/message/IVehicleMessage";
import {LoggerFactory} from "../../common/Logging";

const store = VehicleStore.getInstance()
const logger = LoggerFactory.getLogger()
const AntiCollisionController: Router = Router()
const lastPositionUpdateMessage = new Map<string, LocalizationPositionUpdate|null>([
    ['ed0c94216553', null],
    ['eb401ef0f82b', null]
])
const keyForCounterpart = new Map<string, string>([
    ['ed0c94216553', 'eb401ef0f82b'],
    ['eb401ef0f82b', 'ed0c94216553']
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

    if(vehicle && vehicleId === 'ed0c94216553' && distance <= 2) {
        vehicle.setSpeed(390)
    } else if(vehicle && vehicleId === 'ed0c94216553') {
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
    const v1 = store.getVehicle('ed0c94216553')
    const v2 = store.getVehicle('eb401ef0f82b')

    if(!v1)             return response.status(404).send(`Vehicle [ed0c94216553] does not exist.`)
    if(!v2)             return response.status(404).send(`Vehicle [eb401ef0f82b] does not exist.`)
    if(!v1.connected)   return response.status(409).send(`Vehicle [ed0c94216553] is not connected.`)
    if(!v2.connected)   return response.status(409).send(`Vehicle [eb401ef0f82b] is not connected.`)

    messageListeners.set('ed0c94216553', messageListener.bind({}))
    messageListeners.set('eb401ef0f82b', messageListener.bind({}))

    v1.addListener(messageListeners.get('ed0c94216553'))
    v2.addListener(messageListeners.get('eb401ef0f82b'))

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
    const v1 = store.getVehicle('ed0c94216553')
    const v2 = store.getVehicle('eb401ef0f82b')

    if(!v1)             return response.status(404).send(`Vehicle [ed0c94216553] does not exist.`)
    if(!v2)             return response.status(404).send(`Vehicle [eb401ef0f82b] does not exist.`)
    if(!v1.connected)   return response.status(409).send(`Vehicle [ed0c94216553] is not connected.`)
    if(!v2.connected)   return response.status(409).send(`Vehicle [eb401ef0f82b] is not connected.`)

    try {
       v1.removeListener(messageListeners.get('ed0c94216553'))
       v2.removeListener(messageListeners.get('eb401ef0f82b'))
       v1.setSpeed(0, 500)
       v2.setSpeed(0, 500)
       response.status(200).send(`Stopped Anti-Collision`)
    } catch (error) {
        response.status(500).send(error)
    }
})

export {AntiCollisionController}
