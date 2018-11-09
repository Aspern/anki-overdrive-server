import {VehicleStore} from "../model/VehicleStore";
import {KafkaClient, Producer} from "kafka-node";
import {LoggerFactory} from "../common/Logging";
import {Logger} from "log4js";
import {Settings} from "../Settings";
import {IVehicle} from "anki-overdrive-api";
import {LocalizationPositionUpdate} from "anki-overdrive-api/lib/message/v2c/LocalizationPositionUpdate";
import {Track} from "anki-overdrive-api/lib/track/Track";
import {Straight} from "anki-overdrive-api/lib/track/Straight";
import {Curve} from "anki-overdrive-api/lib/track/Curve";

class KafkaController {

    private _vehicleStore: VehicleStore
    private readonly _kafkaClient: KafkaClient
    private _producer: Producer
    private _logger: Logger = LoggerFactory.getLogger()
    private _listeners = new Map()
    private _lastPositionUpdateMessage = new Map<string, LocalizationPositionUpdate|null>([
        ['ed0c94216553', null],
        ['eb401ef0f82b', null]
    ])
    private _keyForCounterpart =  new Map<string, string>([
        ['ed0c94216553', 'eb401ef0f82b'],
        ['eb401ef0f82b', 'ed0c94216553']
    ])
    private readonly  _track = new Track([
        new Straight(40),
        new Curve(17),
        new Curve(20),
        new Straight(39),
        new Straight(36),
        new Curve(18),
        new Curve(23)
    ])

    public constructor() {
        this._vehicleStore = VehicleStore.getInstance()
        this._kafkaClient = new KafkaClient({kafkaHost: Settings.kafkaHost})
        this._producer = new Producer(this._kafkaClient)
        const self = this

        this._producer.on('error', (error: any) => {
            if(error) self._logger.error(error)
        })
        this._producer.on('ready', this.registerVehicleListeners.bind(this))
    }

    private registerVehicleListeners() {
        this._vehicleStore.getVehicles().forEach(this.createVehicleListener.bind(this))
        this._vehicleStore.onVehicleOnline(this.createVehicleListener.bind(this))
        this._vehicleStore.onVehicleOffline(this.removeVehicleListener.bind(this))
    }

    private createVehicleListener(vehicle: IVehicle) {
        const self = this

        if(!this._listeners.has(vehicle.id)) {
            const listener = (message: any) => {
                if(message) {

                    if(message instanceof LocalizationPositionUpdate) {
                        try {
                            const key = self._keyForCounterpart.get(message.vehicleId)
                            if (key) {
                                const m = self._lastPositionUpdateMessage.get(key)
                                if (m) {
                                    message.setDistance(
                                        self._track.distance([message.roadPieceId, message.locationId], [m.roadPieceId, m.locationId])
                                    )
                                    this._logger.debug(`${message.vehicleId} -> ${m.vehicleId}: distance=${message.distance}`)
                                }
                            }
                            self._lastPositionUpdateMessage.set(message.vehicleId, message)
                        } catch (e) {
                            self._logger.error(e)
                        }
                    }

                    // this._logger.debug(`${vehicle.id} : ${Settings.kafkaTopic} : ${ message.toJsonString()}`)

                    self._producer.send(
                        [{topic: Settings.kafkaTopic, messages: message.toJsonString()}],
                        (error: any) => {if(error) self._logger.error(error)}
                    )
                }
            }

            this._logger.debug(`Adding Kafka listener for vehicle [${vehicle.id}]`)
            vehicle.addListener(listener)
            this._listeners.set(vehicle.id, listener)
        }
    }

    private removeVehicleListener(vehicleId: string) {
        if(this._listeners.has(vehicleId)) {
            this._logger.debug(`Removing Kafka listener for vehicle [${vehicleId}]`)
            this._listeners.delete(vehicleId)
        }
    }
}

export {KafkaController}
