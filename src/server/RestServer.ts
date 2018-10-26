import {RestApi} from "./restapi/index"

const port = process.env.VEHICLE_SERVER_PORT || 4711

RestApi.listen(port, () => {
    console.log("REST api is running on " + port)
})
