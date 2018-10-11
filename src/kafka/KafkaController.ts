import {VehicleStore} from "../model/VehicleStore";
import {KafkaClient, Producer} from "kafka-node";
import {LoggerFactory} from "../common/Logging";
import {Logger} from "log4js";

class KafkaController {

    private vehicleStore: VehicleStore
    private kafkaClient: KafkaClient
    private producer: Producer
    private logger: Logger = LoggerFactory.getLogger()

    public constructor() {
        this.logger.info('Starting KafkaController...')
        this.vehicleStore = VehicleStore.getInstance()
        this.kafkaClient = new KafkaClient()
        this.producer = new Producer(this.kafkaClient)

        const self = this

        this.producer.on('ready', () => {
            self.vehicleStore.onVehicleOnline(vehicle => {
                self.logger.info(`Found vehicle ${vehicle.id}`)
                vehicle.addListener(message => {
                    if(message) self.producer.send([{topic: 'vehicle_message', messages: message.toJsonString()}], error => self.logger.error(error))
                })
                vehicle.connect().then(() => {
                    vehicle.setSpeed(300, 50)
                })
            })
        })
    }
}

export {KafkaController}