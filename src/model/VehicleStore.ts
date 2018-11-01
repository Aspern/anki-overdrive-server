import {IVehicleStore} from "./IVehicleStore";
import {IVehicle} from "anki-overdrive-api";
import {IVehicleScanner} from "anki-overdrive-api";
import {Bluetooth} from "anki-overdrive-api/lib/ble/Bluetooth";
import {VehicleScanner} from "anki-overdrive-api/lib/vehicle/VehicleScanner";
import {Logger} from "log4js";
import {LoggerFactory} from "../common/Logging";

class VehicleStore implements IVehicleStore {

    private static instance: VehicleStore

    private _store: Map<string, IVehicle>
    private _task: any
    private _scanner: IVehicleScanner
    private _interval = 3000
    private _logger: Logger
    private _onlineListener: (vehicle: IVehicle) => any = () => {}
    private _offlineListener: (vehicleId: string) => any = () => {}

    private constructor() {
        const bluetooth = new Bluetooth()

        this._store = new Map<string, IVehicle>()
        this._scanner = new VehicleScanner(bluetooth)
        this._task = setInterval(this.synchronize.bind(this), this._interval)
        this._logger = LoggerFactory.getLogger()
    }

    public static getInstance() {
        if(!VehicleStore.instance) {
            VehicleStore.instance = new VehicleStore()
        }

        return VehicleStore.instance
    }

    public getVehicle(id: string): IVehicle | undefined {
        return this._store.get(id);
    }

    public getVehicleAt(index: number): IVehicle | undefined {
        let i = 0
        let vehicleAtIndex: IVehicle | undefined
        this._store.forEach(vehicle => {
            if(i++ === index)
                vehicleAtIndex = vehicle
        })
        return vehicleAtIndex
    }

    public getVehicles(): IVehicle[] {
        const vehicles: IVehicle[] = []

        this._store.forEach((vehicle) => vehicles.push(vehicle))

        return vehicles
    }

    public onVehicleOffline(listener: (vehicleId: string) => any): IVehicleStore {
        this._offlineListener = listener
        return this
    }

    public onVehicleOnline(listener: (vehicle: IVehicle) => any): IVehicleStore {
        this._onlineListener = listener
        return this
    }

    private synchronize(): void {
        const self = this

        this._scanner.findAll().then((vehicles) => {

            // Add all new vehicles found by the scanner.
            vehicles.forEach(vehicle => {
                if(!self._store.has(vehicle.id) || self.vehicleInStoreHasWrongConnectionState(vehicle.id, vehicle.connected)) {
                    self._logger.debug(`Added vehicle ${vehicle.id}.`)
                    self._store.set(vehicle.id, vehicle)
                    self._onlineListener(vehicle)
                }
            })

            // Remove all stored vehicles, not found by the scanner.
            self._store.forEach((value, key) => {
                let found = false

                if(!value.connected) {
                    vehicles.forEach(vehicle => {
                        if(key === vehicle.id) {
                            found = true
                        }
                    })

                    if(!found) {
                        self._logger.debug(`Removed vehicle ${key}.`)
                        self._store.delete(key)
                        self._offlineListener(key)
                    }
                }
            })

        }).catch(this._logger.error)
    }

    private vehicleInStoreHasWrongConnectionState(vehicleId: string, state: boolean): boolean {
        const vehicle = this._store.get(vehicleId)
        if(vehicle) return vehicle.connected !== state
        return false
    }

}

export {VehicleStore}
