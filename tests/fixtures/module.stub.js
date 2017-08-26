export class ModuleStub {
    static $moduleName = 'ModuleStub';

    constructor() {
        this.configured = false;
        this.running = false;
        this.ioc = null;
    }
    configure(ioc) {
        this.configured = true;
        this.ioc = ioc;
    }
    run() {
        this.running = true;
    }
}

