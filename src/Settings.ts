class Settings {
  public static kafkaHost = 'localhost:9092'
  public static kafkaTopic = 'vehicle_messages'
  public static webServerPort = 8090
  public static vehicleNames = new Map([
      ['ed0c94216553', 'Skull'],
      ['eb401ef0f82b','Ground Shock']
  ])
}

export {Settings}
