import { PluginsManager } from './plugins-manager';
import { ModuleManager } from './module-manager';

export default class Application {
    constructor({ plugins = null} = {}) {
        this._modules = new Map();
        this._pluginsManager = new PluginsManager(plugins);
        this._pluginsManager.afterAppCreated(this);
        this._modulesOrder = [];
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
     *
     * @param {Function[]} modules - List of modules classes which should be registered  in application
     *
     * @return {Application}
     */
    modules(modules) {
        for(let module of modules) {
            this.module(module);
        }

        return this;
    }

    /**
     * Checks that module is registered in application
     *
     * @param {String} name - Module name
     *
     * @returns {boolean}
     */
    hasModule(name) {
        return this._resources.has(name);
    }
    
    init() {
        for(let module, name of this._modules) {
            this._getInitializedModule(module, name);
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
    configure() {

    }

    /**
     *
     *
     * @return {Promise} Promise will be resolved when all modules will be run.
     *                   Or it will rejected when at least one module or plugin will fail at run.
     */
    run() {
        
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
        
    }

    /**
     * Checks that dependencies required in each module resources available in modules which registered application
     * and each module define correct list of required modules. List of missed dependencies will be result of module.
     *
     * TODO: Specify errors: 1 - missed dependency in application, 2 - dependency present in other module which is not specified in module dependencies which holds resource
     */
    resolveUnmetDependencies() {

    }
}
