var sanitize = require('mongo-sanitize');
var mongoose = require('mongoose');

var SecurityHelper = function () {

    this.cleanup = function (param) {
        var clean = sanitize(param);
        return clean;
    };

    this.getValidId = function (param) {
        //Primero nos aseguramos que no tenga ninguna injection
        var clean = sanitize(param);
        //Despues que sea uno valido
        if (mongoose.Types.ObjectId.isValid(clean)) {
            return clean;
        }
        return false;//si no es válido retornar falso;
    };
};

module.exports = SecurityHelper;
/**
 * @usage var controller = new SecurityHelper();
 *        controller.cleanup(paramToClean);
 *        controller.getValidid(id);
 */