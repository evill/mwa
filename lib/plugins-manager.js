"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PluginsManager = function () {
    function PluginsManager(plugins) {
        _classCallCheck(this, PluginsManager);

        this._plugins = new Map();
        // TODO: register all plugins
    }

    _createClass(PluginsManager, [{
        key: "afterAppCreated",
        value: function afterAppCreated(app) {}
    }, {
        key: "afterModuleRegistered",
        value: function afterModuleRegistered(moduleManager) {}
    }, {
        key: "afterModuleCreate",
        value: function afterModuleCreate(moduleManager) {}
    }, {
        key: "beforeAppConfigure",
        value: function beforeAppConfigure(app) {
            return Promise.resolve(app);
        }
    }, {
        key: "beforeModuleConfigure",
        value: function beforeModuleConfigure(moduleManager) {
            return Promise.resolve(moduleManager);
        }
    }, {
        key: "afterModuleConfigure",
        value: function afterModuleConfigure(moduleManager) {
            return Promise.resolve(moduleManager);
        }
    }, {
        key: "afterAppConfigure",
        value: function afterAppConfigure(app) {
            return Promise.resolve(app);
        }
    }, {
        key: "beforeAppRun",
        value: function beforeAppRun(app) {
            return Promise.resolve(app);
        }
    }, {
        key: "beforeModuleRun",
        value: function beforeModuleRun(moduleManager) {
            return Promise.resolve(moduleManager);
        }
    }, {
        key: "afterModuleRun",
        value: function afterModuleRun(moduleManager) {
            return Promise.resolve(moduleManager);
        }
    }, {
        key: "afterAppRun",
        value: function afterAppRun(app) {
            return Promise.resolve(app);
        }
    }, {
        key: "beforeAppDestroy",
        value: function beforeAppDestroy(app) {}
    }, {
        key: "beforeModuleDestroy",
        value: function beforeModuleDestroy(moduleManager) {}
    }, {
        key: "destroy",
        value: function destroy() {
            this._plugins = null;
        }
    }]);

    return PluginsManager;
}();

exports.default = PluginsManager;