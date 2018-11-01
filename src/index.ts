import {LoggerFactory} from "./common/Logging";
import {KafkaController} from "./kafka/KafkaController";
import {VehicleStore} from "./model/VehicleStore";
import {WebService} from "./WebService";
import {Settings} from "./Settings";

const logger = LoggerFactory.getLogger()

logger.info('Starting Vehicle Server.')
logger.info('Bringing up KafkaController...')
new KafkaController()
logger.info(`KafkaController ready, listen on ${Settings.kafkaHost}.`)
logger.info("Bringing up Rest WebService...")
new WebService()
logger.info(`WebService ready, listen on http://localhost:${Settings.webServerPort}.`)

process.on('SIGINT', () => {
    logger.info("Shutting down Vehicle Server...")
    const store = VehicleStore.getInstance()
    const connectedVehicles = store.getVehicles()
        .filter(v => v.connected)

    logger.info(`Found ${connectedVehicles.length} connected vehicles.`)

    connectedVehicles.forEach(v => {
        logger.info(`Disconnecting ${v.id}...`)
        v.disconnect().catch(logger.error)
    })

    setTimeout(() => {
        logger.info("Exit")
        process.exit();
    }, 1500)
});
