var log4js = require('log4js');
var config = require('../config');

log4js.configure(__dirname + '/../config/' + config.Log4js.confPath, {});

/**
 * Logger
 * @use log4js
 * @param tipo el tipo de log que por defecto es middleware
 * @param level el nivel de log que por defecto es 'INFO'
 */
var Logger = function (tipo, level) {
    if (tipo == null) {
        var aLog = log4js.getLogger('middleware');
    }
    else {
        var aLog = log4js.getLogger(tipo);
    }

    if (level == null) {
        aLog.setLevel('INFO');
    } else {
        aLog.setLevel(level);
    }


    this.info = function (string) {
        aLog.info(string);
    };

    this.error = function (string) {
        aLog.error(string);
    };

    this.trace = function (string) {
        aLog.trace(string);
    };

    this.debug = function (string) {
        aLog.debug(string);
    };

    this.warn = function (string) {
        aLog.warn(string);
    };

    this.fatal = function (string) {
        aLog.fatal(string)
    };

};

module.exports = Logger;
/**
 * @usage var logger = new Logger();
 *        logger.msg("String to log");
 *        msg = warn,fatal,debug,trace,error,info
 */