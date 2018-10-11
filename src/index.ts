import {LoggerFactory} from "./common/Logging";
import {KafkaController} from "./kafka/KafkaController";
import {VehicleCli} from "./cli/VehicleCli";

const logger = LoggerFactory.getLogger()

logger.info('Starting vehicle server.')
logger.info('Creating Kafka Controller.')
new KafkaController()
logger.info('Creating CLI.')
new VehicleCli()
