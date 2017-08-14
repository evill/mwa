export class MainModule {
    static $dependencies = ['ConfigModule', 'TransportModule'];

    constructor() {
        this.configured = false;
        this.runing = false;
    }

    configure(ioc) {
        this.configured = true;
        this.ioc = ioc;
    }

    run() {
        this.runing = true;
    }
}

