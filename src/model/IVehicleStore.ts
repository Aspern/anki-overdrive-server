import {IVehicle} from "anki-overdrive-api";

interface IVehicleStore {

    getVehicle(id: string): IVehicle | undefined

    getVehicleAt(index: number): IVehicle | undefined

    getVehicles(): IVehicle[]

    onVehicleOnline(listener: (vehicle: IVehicle) => any): IVehicleStore

    onVehicleOffline(listener: (vehicleId: string) => any): IVehicleStore

}

export {IVehicleStore}