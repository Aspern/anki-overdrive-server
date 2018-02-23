import {RestApi} from "./restapi"

const settings = require("./resources/settings.json")
const port = process.env.VEHICLE_SERVER_PORT ||settings.port

RestApi.listen(port, () => {
    console.log("REST api is running on " + port)
})