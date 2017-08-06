import {IoCContainer, IoCAggregator} from 'ioc';

export default class ModuleManager {
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

    init(...dependencies) {
        if (!this.isInitialized()) {
            let parent;
            
            if (dependencies.length > 0) {
                parent = new IoCAggregator(
                    dependencies.map((module) => module.publicIoc())
                );
            }
            
            this._privateIoc = new IoCContainer({parent});
            this._publicIoc = new IoCAggregator([this._privateIoc], { parentExplicit: false });

            this._moduleInstance = new this._moduleConstructor();

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
            let singleton;
            for (let resourceName in resources) {
                if (resources.hasOwnProperty(resourceName)) {
                    resource = resources[resourceName];
                    
                    // Move to IoCContainer#register 
                    if ((typeof(resource) === 'function') && resource.isRegistrar) {
                        singleton = resource.singleton || false;
                        if (resource.isFunction) {
                            this._privateIoc.registerFunc(resource, resourceName, { singleton });
                            continue;
                        } else if (resource.isClass) {
                            this._privateIoc.registerClass(resource, resourceName, { singleton });
                            continue;
                        }
                        
                    }
                        
                    this._privateIoc.register(resource, resourceName);
                }
            }
        }
    }
    
    _callModuleConfigure() {
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
