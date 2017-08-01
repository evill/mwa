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

    beforeAppConfigure() {

    }

    beforeModuleConfigure(moduleManager) {

    }

    afterModuleConfigure(moduleManager) {

    }

    afterAppConfigure(app) {

    }

    beforeAppRun(app) {

    }

    beforeModuleRun(moduleManager) {

    }

    afterModuleRun(moduleManager) {

    }

    afterAppRun(app) {

    }

    beforeAppDestroy(app) {

    }

    beforeModuleDestroy(moduleManager) {

    }
    
    destroy() {
        this._plugins = null;
    }
}
