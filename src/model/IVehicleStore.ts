import {IVehicle} from "anki-overdrive-api";

interface IVehicleStore {

    getVehicle(id: string): IVehicle | undefined

    getVehicles(): IVehicle[]

}

export {IVehicleStore}