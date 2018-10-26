import {LoggerFactory} from "./server/common/Logging";
import {KafkaController} from "./server/kafka/KafkaController";
import {VehicleCli} from "./server/cli/VehicleCli";

const logger = LoggerFactory.getLogger()

logger.info('Starting vehicle server.')
logger.info('Creating Kafka Controller.')
new KafkaController()
logger.info('Creating CLI.')
new VehicleCli()
