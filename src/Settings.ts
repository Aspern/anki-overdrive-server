class Settings {
  public static kafkaHost = 'localhost:9092'
  public static kafkaTopic = 'vehicle_message'
  public static webServerPort = 8090
  public static skullId = 'c667a5ded647'
  public static groundShockId = 'cb73ac40502a'
  public static vehicleNames = new Map([
      [Settings.skullId, 'Skull'],
      [Settings.groundShockId,'Ground Shock']
  ])
}

export {Settings}
