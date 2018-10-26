import {RestApi} from "./restapi/index"
import {Logger} from "log4js";
import {LoggerFactory} from "./common/Logging";
import {Settings} from "./Settings";

class WebService {
    private readonly _port: number
    private _logger: Logger

    public constructor() {
        this._logger = LoggerFactory.getLogger()
        this._port = Settings.webServerPort || 8081

        const self = this

        RestApi.listen(this._port, () => {
            self._logger.debug(`Webservice running on port ${self._port}.`)
        })
    }
}

export {WebService}
