import PluginsManager from './plugins-manager';
import ModuleManager from './module-manager';

export default class Application {
    constructor({ plugins = null} = {}) {
        this._modules = new Map();
        this._pluginsManager = new PluginsManager(plugins);
        this._modulesOrder = null;
        this._pluginsManager.afterAppCreated(this);
    }

    /**
     * Register new unique module in application
     *
     * @param {Function} module - Module class
     *
     * @return {Application}
     */
    module(module) {
        const name = module.name;
        if (this.hasModule(name)) {
            throw new Error(`Resource with name '${name}' already registered in container!`);
        }

        this._modules.set(name, new ModuleManager(module, this._pluginsManager));

        return this;
    }

    /**
     * @return {Application}
     */
    modules(...modules) {
        for(let module of modules) {
            this.module(module);
        }

        return this;
    }

    moduleInstance(name) {
        if (this.hasModule(name)) {
            return this._modules.get(name).moduleInstance();
        }

        throw new ReferenceError(`Module with name '${name}' is not registered in application!`);
    }
    /**
     * Checks that module is registered in application
     *
     * @param {String} name - Module name
     *
     * @returns {boolean}
     */
    hasModule(name) {
        return this._modules.has(name);
    }
    
    _init() {
        this._modulesOrder = [];

        for(let [name, module] of this._modules) {
            this._getInitializedModule(module, name);
        }

        return this;
    }

    _failOnUnmetDependencies() {
        const unmentDependencies = this.resolveUnmetDependencies();
        if (unmentDependencies) {
            throw new ReferenceError(
                `Filed due to missed modules ${unmentDependencies},
                which defined in dependencies but not registered in application!`
            );
        }
    }

    _getInitializedModule(module, name) {
        // TODO: add detection of cycles
        if (!module.isInitialized()) {
            const depsNames = module.getDependencies();
            let depsModules = [];

            if (Array.isArray(depsNames)) {
                depsModules = depsNames.reduce((acc, name) => {
                    acc.push(
                        this._getInitializedModule(this._modules.get(name), name)
                    )

                    return acc;
                }, depsModules);
            }

            module.init(...depsModules);

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
    _configure() {
        return this._init()._pluginsManager.beforeAppConfigure(this).then(
            (app) => {
                return this._modulesOrder.reduce((acc, moduleName) => {
                    let module = this._modules.get(moduleName);
                    let modulePromise = module.configure();

                    return acc ? acc.then(() => modulePromise) : modulePromise;
                }, null).then(
                    () => app
                );
            }
        ).then(
            (app) => this._pluginsManager.afterAppConfigure(this)
        );
    }

    /**
     *
     *
     * @return {Promise} Promise will be resolved when all modules will be run.
     *                   Or it will rejected when at least one module or plugin will fail at run.
     */
    run() {
        return this._configure().then(
            (app) => this._pluginsManager.beforeAppRun(app)
        ).then(
            (app) => {
                return this._modulesOrder.reduce((acc, moduleName) => {
                    let module = this._modules.get(moduleName);
                    let modulePromise = module.run();

                    return acc ? acc.then(() => modulePromise) : modulePromise;
                }, null).then(
                    () => app
                );
            }
        ).then(
            (app) => this._pluginsManager.afterAppRun(app)
        );
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
    destroy() {
        this._pluginsManager.beforeAppDestroy(this);
        for (let module of this._modulesOrder) {
            module.destroy();
        }
    }

    /**
     * Checks that dependencies required in each module resources available in modules which registered application
     * and each module define correct list of required modules. List of missed dependencies will be result of module.
     *
     * TODO: Specify errors: 1 - missed dependency in application, 2 - dependency present in other module which is not specified in module dependencies which holds resource
     */
    resolveUnmetDependencies() {

    }

    getRunOrder() {
        return this._modulesOrder;
    }
}
