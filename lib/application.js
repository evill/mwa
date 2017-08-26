'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ioc = require('ioc');

var _pluginsManager = require('./plugins-manager');

var _pluginsManager2 = _interopRequireDefault(_pluginsManager);

var _moduleManager = require('./module-manager');

var _moduleManager2 = _interopRequireDefault(_moduleManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Application = function () {
    function Application() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref$plugins = _ref.plugins,
            plugins = _ref$plugins === undefined ? null : _ref$plugins,
            _ref$resources = _ref.resources,
            resources = _ref$resources === undefined ? null : _ref$resources;

        _classCallCheck(this, Application);

        this._modules = new Map();
        this._pluginsManager = new _pluginsManager2.default(plugins);
        this._modulesOrder = null;
        this._pluginsManager.afterAppCreated(this);
        this._ioc = new _ioc.IoCContainer();

        if (resources) {
            this.resources(resources);
        }
    }

    /**
     * Register shared resources which will be available for all modules
     * 
     * For example raw config or initial state resolved from environment
     * 
     * @param {Object} resources - Resources hash where keys are resources names and values a resources or/and registrars
     * 
     * @returns {Application}
     */


    _createClass(Application, [{
        key: 'resources',
        value: function resources(_resources) {
            this._ioc.registerAll(_resources);

            return this;
        }
        /**
         * Register new unique module in application
         *
         * @param {Function} module - Module class
         *
         * @return {Application}
         */

    }, {
        key: 'module',
        value: function module(_module) {
            var name = _module.$moduleName;
            if (this.hasModule(name)) {
                throw new Error('Resource with name \'' + name + '\' already registered in container!');
            }

            this._modules.set(name, new _moduleManager2.default(this, _module, this._pluginsManager));

            return this;
        }

        /**
         * Provides ability to register several modules which passes as list of method parameters 
         * @return {Application}
         */

    }, {
        key: 'modules',
        value: function modules() {
            for (var _len = arguments.length, _modules = Array(_len), _key = 0; _key < _len; _key++) {
                _modules[_key] = arguments[_key];
            }

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = _modules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var module = _step.value;

                    this.module(module);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return this;
        }
    }, {
        key: 'moduleInstance',
        value: function moduleInstance(name) {
            if (this.hasModule(name)) {
                return this._modules.get(name).moduleInstance();
            }

            throw new ReferenceError('Module with name \'' + name + '\' is not registered in application!');
        }
        /**
         * Checks that module is registered in application
         *
         * @param {String} name - Module name
         *
         * @returns {boolean}
         */

    }, {
        key: 'hasModule',
        value: function hasModule(name) {
            return this._modules.has(name);
        }
    }, {
        key: '_init',
        value: function _init() {
            this._modulesOrder = [];

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this._modules[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _step2$value = _slicedToArray(_step2.value, 2),
                        name = _step2$value[0],
                        module = _step2$value[1];

                    this._getInitializedModule(module, name);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return this;
        }
    }, {
        key: '_failOnUnmetDependencies',
        value: function _failOnUnmetDependencies() {
            var unmentDependencies = this.resolveUnmetDependencies();
            if (unmentDependencies) {
                throw new ReferenceError('Filed due to missed modules ' + unmentDependencies + ',\n                which defined in dependencies but not registered in application!');
            }
        }
    }, {
        key: '_getInitializedModule',
        value: function _getInitializedModule(module, name) {
            var _this = this;

            // TODO: add detection of cycles
            if (!module.isInitialized()) {
                var depsNames = module.getDependencies();
                var depsModules = [];

                if (Array.isArray(depsNames)) {
                    depsModules = depsNames.reduce(function (acc, name) {
                        acc.push(_this._getInitializedModule(_this._modules.get(name), name));

                        return acc;
                    }, depsModules);
                }

                module.init.apply(module, [this._ioc].concat(_toConsumableArray(depsModules)));

                this._modulesOrder.push(name);
            }

            return module;
        }
        /**
         *
         * + verify missed dependencies
         *
         * @return {Promise} Promise will be resolved when all modules will be configured.
         *                   Or it will rejected when at least one module or plugin will fail at configure.
         */

    }, {
        key: '_configure',
        value: function _configure() {
            var _this2 = this;

            return this._init()._pluginsManager.beforeAppConfigure(this).then(function (app) {
                return _this2._modulesOrder.reduce(function (acc, moduleName) {
                    var module = _this2._modules.get(moduleName);
                    var modulePromise = module.configure();

                    return acc ? acc.then(function () {
                        return modulePromise;
                    }) : modulePromise;
                }, null).then(function () {
                    return app;
                });
            }).then(function (app) {
                return _this2._pluginsManager.afterAppConfigure(_this2);
            });
        }

        /**
         *
         *
         * @return {Promise} Promise will be resolved when all modules will be run.
         *                   Or it will rejected when at least one module or plugin will fail at run.
         */

    }, {
        key: 'run',
        value: function run() {
            var _this3 = this;

            return this._configure().then(function (app) {
                return _this3._pluginsManager.beforeAppRun(app);
            }).then(function (app) {
                return _this3._modulesOrder.reduce(function (acc, moduleName) {
                    var module = _this3._modules.get(moduleName);
                    var modulePromise = module.run();

                    return acc ? acc.then(function () {
                        return modulePromise;
                    }) : modulePromise;
                }, null).then(function () {
                    return app;
                });
            }).then(function (app) {
                return _this3._pluginsManager.afterAppRun(app);
            });
        }
        /**
         * Destroy all modules and internal resources
         *
         * There is follow order of application destroy
         * 1. beforeAppDestroy hook of plugins
         * 2. Destroy modules
         *  2.1 beforeModuleDestroy hook of plugins for each module
         *  2.2 destroy method of each module
         * 3. Clearing internal state
         *
         */

    }, {
        key: 'destroy',
        value: function destroy() {
            this._pluginsManager.beforeAppDestroy(this);
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this._modulesOrder[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var module = _step3.value;

                    module.destroy();
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }

        /**
         * Checks that dependencies required in each module resources available in modules which registered application
         * and each module define correct list of required modules. List of missed dependencies will be result of module.
         *
         * TODO: Specify errors: 1 - missed dependency in application, 2 - dependency present in other module which is not specified in module dependencies which holds resource
         */

    }, {
        key: 'resolveUnmetDependencies',
        value: function resolveUnmetDependencies() {}
    }, {
        key: 'getRunOrder',
        value: function getRunOrder() {
            return this._modulesOrder;
        }
    }]);

    return Application;
}();

exports.default = Application;