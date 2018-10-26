# Changelog

## 1.0.0
- Implemented REST-API for the most vehicle commands (see api [docs](https://app.swaggerhub.com/apis-docs/Aspern/Anki-Overdrive/1.0.0)).
- Implemented `KafkaController` which detects connecting vehicles and registers a
listener to send all kind of vehicle messages to topic `vehicle_messages`.
- Added file/console logging.
