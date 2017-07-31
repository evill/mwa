export default class PluginsManager {
    constructor() {
        this._plugins = new Map();
    }
    register() {

    }
    afterAppCreated(app) {

    }

    beforeModuleRegistered(moduleConstructor) {

    }

    afterModuleRegistered(moduleConstructor) {

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

    beforeModuleDestroy(moduleManager) {

    }

    beforeAppDestroy(app) {

    }
    destroy() {
        this._plugins = null;
    }
}
