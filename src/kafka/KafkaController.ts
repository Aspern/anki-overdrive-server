import {VehicleStore} from "../model/VehicleStore";
import {KafkaClient, Producer} from "kafka-node";
import {LoggerFactory} from "../common/Logging";
import {Logger} from "log4js";
import {Settings} from "../Settings";
import {IVehicle} from "anki-overdrive-api";

class KafkaController {

    private _vehicleStore: VehicleStore
    private readonly _kafkaClient: KafkaClient
    private _producer: Producer
    private _logger: Logger = LoggerFactory.getLogger()
    private _listeners = new Map()

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
                    this._logger.debug(`${vehicle.id} : ${Settings.kafkaTopic} : ${ message.toJsonString()}`)
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
