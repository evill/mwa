import {IoCContainer, IoCAggregator} from 'ioc';

export class ModuleManager {
    /**
     * @param {Function} moduleConstructor - Class of new module
     * @param {PluginsManager} pluginsManager
     */
    constructor(moduleConstructor, pluginsManager) {
        this._moduleConstructor = moduleConstructor;
        this._name = moduleConstructor.name;
        this._moduleInstance = null;
        this._pluginsManager = pluginsManager;
        this._pluginsManager.afterModuleRegistered(this);
        // this._dependencies = null;
        this._ioc = null;
    }

    createDependenciesInjector() {
        return moduleDependencyInjector(this);
    }

    getDependencies() {
        if (this._moduleConstructor.$dependencies) {
            return this._moduleConstructor.$dependencies;
        }

        return null;
    }

    ioc() {
        return this._ioc;
    }

    isInitialized() {
        return !!this._ioc;
    }

    init(...dependencies) {
        if (!this.isInitialized()) {
            // this._dependencies = dependencies;
            let parent;

            if (dependencies.length > 0) {
                parent = new IoCAggregator(
                    dependencies.map((module) => module.ioc())
                );
            }

            this._ioc = new IoCContainer({parent});

            return this;
        }

        throw new Error(`Attempt to init module '${this._name}' which already was initialized!`);
    }

    moduleConstructor() {
        return this._moduleConstructor;
    }

    moduleInstance() {
        return this._moduleInstance;
    }

    configure() {

    }

    run() {

    }

    destroy() {
        if (this._moduleInstance && (typeof(this._moduleInstance) === 'function')) {
            this._pluginsManager.beforeModuleDestroy(this);
            this._moduleInstance.destroy();
            this._moduleInstance = null;
        }

        this._moduleConstructor = null;
        this._pluginsManager = null;
    }
}

export let moduleDependencyInjector = (moduleManager) => {
    let injector = (...dependencies) => {
        return moduleManager.init(...dependencies);
    };

    injector.$inject = moduleManager.getDependencies();

    return injector;
};
