import Application from '../../lib/application';
import { iocClass, iocFunc } from 'ioc';

class ConfigModule {
    static $resources = {
        config: {
            logPrefix: "MVA"
        }
    };
}

function consoleFactory () {
    return {
        log: console.log
    }
}

class ConsoleModule {
    static $resources = {
        console: iocFunc(consoleFactory).asSingleton()
    };
}

class Logger {
    static $inject = ['config', 'console'];

    constructor(config, console) {
        this.config = config;
        this.console = console;
    }

    log(message) {
        this.console.log(`${this.config.logPrefix}: ${message}`);
    }
}

class LoggerModule {
    static $dependencies = ['ConfigModule', 'ConsoleModule'];
    static $resources = {
        logger: iocClass(Logger).asSingleton()
    };
}

class MainModule {
    static $dependencies = ['ConfigModule', 'LoggerModule'];
    
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

describe('Application class', function () {
    describe('Constructor', function () {
        it('should create new instance of Application', function () {
            var app = new Application();

            expect(app).to.be.an.instanceof(Application);
        });
    });

    describe('run method', function () {
        beforeEach(function () {
            this.app = new Application();

            this.modules = [MainModule, ConsoleModule, LoggerModule, ConfigModule];

            this.app.modules(...this.modules);
        });

        afterEach(function () {
            delete this.app;
        });

        it('should run application with modules', function (done) {
            this.app.run().then(
                (app) => {
                    expect(app).to.be.an.instanceof(Application)
                }
            ).then(done, done)
        });

        it('should run modules in right order', function (done) {
            const modulesOrder = [ConfigModule, ConsoleModule, LoggerModule, MainModule].map(module => module.name);

            this.app.run().then(
                (app) => {
                    expect(app.getRunOrder()).to.deep.equal(modulesOrder)
                }
            ).then(done, done);
        });

        describe('on configuration phase', function () {

            it('should call method configure of module on application run', function (done) {
                this.app.run().then(
                    (app) => {
                        let mainModule = app.moduleInstance('MainModule');

                        expect(mainModule.configured).to.be.true;
                        done();
                    }
                ).catch(done);
            });

            it('should wait until custom configuration of module will not resolve promise', function (done) {
                var app = new Application();

                let LazyModule = class {
                    constructor() {
                        this.configured = false;
                    }
                    configure() {
                        return new Promise((resolve) => {
                            setTimeout(() => {
                                this.configured = true;
                                resolve();
                            }, 1000)
                        });
                    }
                };

                app.module(LazyModule).run().then(
                    (app) => {
                        let mainModule = app.moduleInstance('LazyModule');

                        expect(mainModule.configured).to.be.true;
                        done();
                    }
                ).catch(done);
            });
        });

        describe('on running phase', function () {

            it('should call method run of module on application run', function (done) {
                this.app.run().then(
                    (app) => {
                        let mainModule = app.moduleInstance('MainModule');

                        expect(mainModule.runing).to.be.true;
                        done();
                    }
                ).catch(done);
            });
        });
    });
});
