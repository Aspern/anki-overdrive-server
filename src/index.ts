import {LoggerFactory} from "./common/Logging";
import {KafkaController} from "./kafka/KafkaController";
import {VehicleCli} from "./cli/VehicleCli";
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
