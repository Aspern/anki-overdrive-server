import {IVehicleStore} from "../model/IVehicleStore";
import {VehicleStore} from "../model/VehicleStore";
import * as ReadLine from 'readline'
import {Logger} from "log4js";
import {LoggerFactory} from "../common/Logging";

const COMMANDS = {
    BATTERY_LEVEL: 'battery',
    CHANGE_LANE: 'lane',
    CONNECT: 'con',
    DISCONNECT: 'dcon',
    EXIT: 'exit',
    HELP: 'help',
    LIST: 'ls',
    PING: 'ping',
    SET_SPEED: 'speed',
    TURN: 'turn',
    VERSION: 'version'
}

class VehicleCli {
    private store: IVehicleStore
    private readLine: any
    private logger: Logger

    public constructor() {
        this.store = VehicleStore.getInstance()
        this.logger = LoggerFactory.getLogger()
        this.readLine = ReadLine.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: ' > '
        })
        this.readLine.on('line', this.parseLice.bind(this))
        this.readLine.prompt()
    }

    private parseLice(line: string) {
        const command = this.parseCommand(line)
        const args: any = this.parseArgs(line)

        switch(command) {
            case COMMANDS.HELP:
                this.showHelp()
                break
            case COMMANDS.LIST:
                this.listVehicles()
                break
            case COMMANDS.EXIT:
                this.exit()
                break
            case COMMANDS.CONNECT:
                this.connect(...args)
                break
            case COMMANDS.DISCONNECT:
                this.disconnect(...args)
                break
            case COMMANDS.SET_SPEED:
                this.setSpeed(args)
                break
            case COMMANDS.CHANGE_LANE:
                this.changeLane(args)
                break
            case COMMANDS.TURN:
                this.turn(...args)
                break
            case COMMANDS.BATTERY_LEVEL:
                this.queryBatteryLevel(...args)
                break
            case COMMANDS.VERSION:
                this.queryVersion(...args)
                break
            case COMMANDS.PING:
                this.queryPing(...args)
                break
        }
        this.readLine.prompt()
    }

    private parseCommand(line: string): string {
        return line.split(' ')[0]
    }

    private parseArgs(line: string): string[]  {
        return line.split(' ').slice(1)
    }

    private turn(index = '0') {
        const vehicle = this.store.getVehicleAt(parseInt(index))
        if(vehicle && vehicle.connected) {
            vehicle.uTurn()
        }
    }

    private queryBatteryLevel(index?: string) {
        console.log(`\tVEHICLE_ID   BATTERY_LEVEL`)
        if(index) {
            const vehicle = this.store.getVehicleAt(parseInt(index))
            if(vehicle && vehicle.connected) {
                vehicle.queryBatterLevel().then((batteryLevel: any) => {
                    console.log(`\t${vehicle.id}   ${batteryLevel}`)
                })
            }
        } else {
            this.store.getVehicles().forEach(vehicle => {
                if(vehicle.connected) {
                    vehicle.queryBatterLevel().then((batteryLevel: any) => {
                        console.log(`\t${vehicle.id}   ${batteryLevel}`)
                    })
                }
            })
        }
    }

    private queryVersion(index?: string) {
        console.log(`\tVEHICLE_ID   VERSION`)
        if(index) {
            const vehicle = this.store.getVehicleAt(parseInt(index))
            if(vehicle && vehicle.connected) {
                vehicle.queryVersion().then((version: any) => {
                    console.log(`\t${vehicle.id}   ${version}`)
                })
            }
        } else {
            this.store.getVehicles().forEach(vehicle => {
                if(vehicle.connected) {
                    vehicle.queryVersion().then((version: any) => {
                        console.log(`\t${vehicle.id}   ${version}`)
                    })
                }
            })
        }
    }

    private queryPing(index?: string) {
        console.log(`\tVEHICLE_ID   BATTERY_LEVEL`)
        if(index) {
            const vehicle = this.store.getVehicleAt(parseInt(index))
            if(vehicle && vehicle.connected) {
                vehicle.queryPing().then((ping: any) => {
                    console.log(`\t${vehicle.id}   ${ping}`)
                })
            }
        } else {
            this.store.getVehicles().forEach(vehicle => {
                if(vehicle.connected) {
                    vehicle.queryPing().then((ping: any) => {
                        console.log(`\t${vehicle.id}   ${ping}`)
                    })
                }
            })
        }
    }

    private exit() {
        process.exit(0)
    }

    private showHelp() {
        console.log(`
            COMMAND     ARGS                    DESCRIPTION
            exit                                exits the application.
            ls                                  lists all vehicle in the ble network.
            con         [index]                 connects a given vehicle or all vehicles if no arg is specified.
            dcon        [index]                 connects a given vehicle or all vehicles if no arg is specified.
            speed       index, speed[,accel]    Changes the speed (using an optional acceleration).
            lane        index, offset           Changes the lane of the vehicle using an offset from -68 to +68 mm.
            battery     [index]                 Queries the battery level of all or a specified vehicle.
            version     [index]                 Queries the version level of all or a specified vehicle.
            ping        [index]                 Queries the ping of all or a specified vehicle.
            turn        index                   Turns the specified vehicle by 180°.
        `)
    }

    private connect(index?: string) {
        if(index) {
            const vehicle = this.store.getVehicleAt(parseInt(index))
            if(vehicle) {
                vehicle.connect().catch(this.logger.error)
            }
        } else {
            this.store.getVehicles().forEach(vehicle => {
                vehicle.connect().catch(this.logger.error)
            })
        }

    }

    private setSpeed([index = '0', speed = '500', accel = '250']) {
        const vehicle = this.store.getVehicleAt(parseInt(index))
        if(vehicle && vehicle.connected) {
            vehicle.setSpeed(parseInt(speed), parseInt(accel))
        }
    }

    private changeLane([index = '0', offset = '0']) {
        const vehicle = this.store.getVehicleAt(parseInt(index))
        if(vehicle && vehicle.connected) {
            vehicle.changeLane(parseInt(index), parseInt(offset))
        }
    }

    private disconnect(index?: string) {
        if(index) {
            const vehicle = this.store.getVehicleAt(parseInt(index))
            if(vehicle) {
                vehicle.disconnect().catch(this.logger.error)
            }
        } else {
            this.store.getVehicles().forEach(vehicle => {
                vehicle.disconnect().catch(this.logger.error)
            })
        }
    }

    private listVehicles() {
        console.log()
        console.log(`\tINDEX   VEHICLE_ID  ADDRESS`)
        let i = 0
        this.store.getVehicles().forEach(vehicle => {
            console.log(`\t${i++}      ${vehicle.id}  ${vehicle.address}`)
        })
        console.log()
    }

}

export {VehicleCli}
