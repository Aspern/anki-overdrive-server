import {configure, getLogger, Logger} from "log4js";
const devMode = process.argv.indexOf('dev') > 0

configure({
    appenders: {
        console: {
            type: 'console'
        },
        file: {
            filename: 'log/application.log',
            pattern: '-yyyy-MM-dd',
            type: 'dateFile',
        }
    },
    categories: {
        default: { appenders: ['console', 'file'], level: 'INFO'},
        dev: { appenders: ['console', 'file'], level: 'DEBUG' }
    }
})

class LoggerFactory {
    public static getLogger(): Logger {
        return  getLogger(devMode ? 'dev' : 'default')
    }
}

export{LoggerFactory}
