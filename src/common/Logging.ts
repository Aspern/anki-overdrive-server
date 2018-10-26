import {configure, getLogger, Logger} from "log4js";
const devMode = process.argv.indexOf('dev') > 0

configure({
    appenders: {
        file: {
            type: 'dateFile',
            filename: 'log/application.log',
            pattern: '-yyyy-MM-dd'
        }
    },
    categories: {
        default: { appenders: ['file'], level: 'WARN'},
        dev: { appenders: ['file'], level: 'DEBUG' }
    }
})

class LoggerFactory {
    static getLogger(): Logger {
        return  getLogger(devMode ? 'dev' : 'default')
    }
}

export{LoggerFactory}