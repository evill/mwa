import { PluginsManager } from './plugins-manager';
import { ModuleManager } from './module-manager';

export default class Application {
    constructor({ plugins = null} = {}) {
        this._modules = new Map();
        this._pluginsManager = new PluginsManager(plugins);
    }
    module(module) {
        const name = module.name;
        if (this.hasModule(name)) {
            throw new Error(`Resource with name '${name}' already registered in container!`);
        }

        this._modules.set(name, new ModuleManager(module));

        return this;
    }
    hasModule(name) {
        return this._resources.has(name);
    }

    configure() {
        
    }

    run() {
        
    }

    destroy() {
        
    }

    resolveUnmetDependencies() {

    }
}
