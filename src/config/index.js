/**
 * Para utilizar la configuración adecuada de SANDBOX, especificar el node_envs
 * Para levantar una configuración cualqiuera: var config = require(./config)
 * Luego las cofiguraciones se pueden acceder como atributos de las variable config
 * config.cf1, config.cf2, etc
 */

module.exports = require('./' + (process.env.NODE_ENV || 'development') + '.json');
