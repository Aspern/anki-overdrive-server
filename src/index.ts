import {LoggerFactory} from "./common/Logging";
import {KafkaController} from "./kafka/KafkaController";

const logger = LoggerFactory.getLogger()

logger.info('Starting vehicle server...')

new KafkaController()
