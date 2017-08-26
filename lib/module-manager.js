import {IoCContainer, IoCAggregator} from 'ioc';

export default class ModuleManager {
    /**
     * @param {Application} app - Instance of app
     * @param {Function} moduleConstructor - Class of new module
     * @param {PluginsManager} pluginsManager
     */
    constructor(app, moduleConstructor, pluginsManager) {
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

    getDependencies() {
        if (this._moduleConstructor.$dependencies) {
            return this._moduleConstructor.$dependencies;
        }

        return null;
    }

    privateIoc() {
        return this._privateIoc;
    }

    publicIoc() {
        return this._publicIoc;
    }

    isInitialized() {
        return !!this._moduleInstance;
    }

    init(appIoc, ...dependencies) {
        if (!this.isInitialized()) {
            let parent;
            let parentIocs = [ appIoc ];
            
            if (dependencies.length > 0) {
                let dependenciesIocs = dependencies.map((module) => module.publicIoc());

                parentIocs.push(...dependenciesIocs);
            }

            parent = new IoCAggregator(parentIocs);
            
            this._privateIoc = new IoCContainer({parent});
            this._publicIoc = new IoCAggregator([this._privateIoc], { parentExplicit: false });

            this._moduleInstance = new this._moduleConstructor(this._app);

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
        return this._pluginsManager.beforeModuleConfigure(this).then(
            () =>  this._callModuleConfigure()
        ).then(
            () => this._pluginsManager.afterModuleConfigure(this)
        );
    }
    
    _registerModuleResources() {
        let resources = this._moduleInstance.$resources || this._moduleConstructor.$resources || null;

        if (resources) {
            let resource;
            for (let resourceName in resources) {
                if (resources.hasOwnProperty(resourceName)) {
                    resource = resources[resourceName];
                    this._privateIoc.register(resourceName, resource);
                }
            }
        }
    }
    
    _callModuleConfigure() {
        this._registerModuleResources();

        if (typeof(this._moduleInstance.configure) === 'function') {
            try {
                return this._moduleInstance.configure(this._privateIoc) || this;
            } catch (error) {
                return Promise.reject(error);
            }
        }

        return Promise.resolve(this);
    }

    run() {
        return this._pluginsManager.beforeModuleRun(this).then(
            () => this._callModuleRun()
        ).then(
            () => this._pluginsManager.afterModuleRun(this)
        );
    }

    _callModuleRun() {
        if (typeof(this._moduleInstance.run) === 'function') {
            try {
                return this._moduleInstance.run() || this;
            } catch(error) {
                return Promise.reject(error);
            }
        }
        
        return Promise.resolve(this);
    }

    destroy() {
        if (this._moduleInstance) {
            this._pluginsManager.beforeModuleDestroy(this);

            if (typeof(this._moduleInstance.destroy) === 'function') {
                this._moduleInstance.destroy();
            }
            
            this._moduleInstance = null;
        }

        this._moduleConstructor = null;
        this._pluginsManager = null;
    }
}
