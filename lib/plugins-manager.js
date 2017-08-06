export default class PluginsManager {
    constructor(plugins) {
        this._plugins = new Map();
        // TODO: register all plugins
    }

    afterAppCreated(app) {

    }

    afterModuleRegistered(moduleManager) {

    }

    afterModuleCreate(moduleManager) {

    }

    beforeAppConfigure(app) {
        return Promise.resolve(app);
    }

    beforeModuleConfigure(moduleManager) {
        return Promise.resolve(moduleManager);
    }

    afterModuleConfigure(moduleManager) {
        return Promise.resolve(moduleManager);
    }

    afterAppConfigure(app) {
        return Promise.resolve(app);
    }

    beforeAppRun(app) {
        return Promise.resolve(app);
    }

    beforeModuleRun(moduleManager) {
        return Promise.resolve(moduleManager);
    }

    afterModuleRun(moduleManager) {
        return Promise.resolve(moduleManager);
    }

    afterAppRun(app) {
        return Promise.resolve(app);
    }

    beforeAppDestroy(app) {

    }

    beforeModuleDestroy(moduleManager) {

    }
    
    destroy() {
        this._plugins = null;
    }
}
