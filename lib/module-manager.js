'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ioc = require('ioc');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ModuleManager = function () {
    /**
     * @param {Application} app - Instance of app
     * @param {Function} moduleConstructor - Class of new module
     * @param {PluginsManager} pluginsManager
     */
    function ModuleManager(app, moduleConstructor, pluginsManager) {
        _classCallCheck(this, ModuleManager);

        this._app = app;
        this._moduleConstructor = moduleConstructor;
        this._name = moduleConstructor.$moduleName;
        this._moduleInstance = null;
        this._pluginsManager = pluginsManager;
        this._pluginsManager.afterModuleRegistered(this);
        /**
         * IoC container which provide access to module resource and to resources from modules defined in dependencies.
         * It should be used only inside current module
         * 
         * @type {IoCContainer}
         * @private
         */
        this._privateIoc = null;
        /**
         * IoC aggregator which provide access only to resource of current module. 
         * It can be used only outside of current module as source of resources for external dependencies
         *
         * @type {IoCAggregator}
         * @private
         */
        this._publicIoc = null;
    }

    _createClass(ModuleManager, [{
        key: 'getDependencies',
        value: function getDependencies() {
            if (this._moduleConstructor.$dependencies) {
                return this._moduleConstructor.$dependencies;
            }

            return null;
        }
    }, {
        key: 'privateIoc',
        value: function privateIoc() {
            return this._privateIoc;
        }
    }, {
        key: 'publicIoc',
        value: function publicIoc() {
            return this._publicIoc;
        }
    }, {
        key: 'isInitialized',
        value: function isInitialized() {
            return !!this._moduleInstance;
        }
    }, {
        key: 'init',
        value: function init(appIoc) {
            if (!this.isInitialized()) {
                var parent = void 0;
                var parentIocs = [appIoc];

                for (var _len = arguments.length, dependencies = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    dependencies[_key - 1] = arguments[_key];
                }

                if (dependencies.length > 0) {
                    var dependenciesIocs = dependencies.map(function (module) {
                        return module.publicIoc();
                    });

                    parentIocs.push.apply(parentIocs, _toConsumableArray(dependenciesIocs));
                }

                parent = new _ioc.IoCAggregator(parentIocs);

                this._privateIoc = new _ioc.IoCContainer({ parent: parent });
                this._publicIoc = new _ioc.IoCAggregator([this._privateIoc], { parentExplicit: false });

                this._moduleInstance = new this._moduleConstructor(this._app);

                return this;
            }

            throw new Error('Attempt to init module \'' + this._name + '\' which already was initialized!');
        }
    }, {
        key: 'moduleConstructor',
        value: function moduleConstructor() {
            return this._moduleConstructor;
        }
    }, {
        key: 'moduleInstance',
        value: function moduleInstance() {
            return this._moduleInstance;
        }
    }, {
        key: 'configure',
        value: function configure() {
            var _this = this;

            return this._pluginsManager.beforeModuleConfigure(this).then(function () {
                return _this._callModuleConfigure();
            }).then(function () {
                return _this._pluginsManager.afterModuleConfigure(_this);
            });
        }
    }, {
        key: '_registerModuleResources',
        value: function _registerModuleResources() {
            var resources = this._moduleInstance.$resources || this._moduleConstructor.$resources || null;

            if (resources) {
                var resource = void 0;
                for (var resourceName in resources) {
                    if (resources.hasOwnProperty(resourceName)) {
                        resource = resources[resourceName];
                        this._privateIoc.register(resourceName, resource);
                    }
                }
            }
        }
    }, {
        key: '_callModuleConfigure',
        value: function _callModuleConfigure() {
            this._registerModuleResources();

            if (typeof this._moduleInstance.configure === 'function') {
                try {
                    return this._moduleInstance.configure(this._privateIoc) || this;
                } catch (error) {
                    return Promise.reject(error);
                }
            }

            return Promise.resolve(this);
        }
    }, {
        key: 'run',
        value: function run() {
            var _this2 = this;

            return this._pluginsManager.beforeModuleRun(this).then(function () {
                return _this2._callModuleRun();
            }).then(function () {
                return _this2._pluginsManager.afterModuleRun(_this2);
            });
        }
    }, {
        key: '_callModuleRun',
        value: function _callModuleRun() {
            if (typeof this._moduleInstance.run === 'function') {
                try {
                    return this._moduleInstance.run() || this;
                } catch (error) {
                    return Promise.reject(error);
                }
            }

            return Promise.resolve(this);
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            if (this._moduleInstance) {
                this._pluginsManager.beforeModuleDestroy(this);

                if (typeof this._moduleInstance.destroy === 'function') {
                    this._moduleInstance.destroy();
                }

                this._moduleInstance = null;
            }

            this._moduleConstructor = null;
            this._pluginsManager = null;
        }
    }]);

    return ModuleManager;
}();

exports.default = ModuleManager;