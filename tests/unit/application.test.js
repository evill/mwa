import Application from '../../lib/application';
import { iocClass, iocFactory } from 'ioc';

import { ConfigurationError, RunningError } from '../fixtures/errors.dummy';
import {
    LazyModuleStub,
    LazyFailedConfigurationModule,
    LazyFailedRunModule
} from '../fixtures/lazy-module.stub';
import { ModuleStub } from '../fixtures/module.stub';

export let config = {
    logPrefix: "MVA"
};

export class ConfigModule {
    static $resources = { config };
}

function consoleFactory () {
    return {
        log: console.log
    }
}

class ConsoleModule {
    static $resources = {
        console: iocFactory(consoleFactory).asSingleton()
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

class MainService {

    static $inject = ['config', 'logger'];

    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }
}

class MainModule  extends ModuleStub {
    static $dependencies = ['ConfigModule', 'LoggerModule'];

    static $resources = {
      mainService: iocClass(MainService)
    };
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

                app.module(LazyModuleStub).run().then(
                    (app) => {
                        let mainModule = app.moduleInstance('LazyModuleStub');

                        expect(mainModule.configured).to.be.true;
                        done();
                    }
                ).catch(done);
            });

            it('should fail application run in case if some module fails configuration', function (done) {
                var app = new Application();

                app.module(LazyFailedConfigurationModule).run().then(
                    () => {
                        done(new Error("Application with failed module configuration successfully ran!"));
                    }
                ).catch(
                    (error) => {
                        expect(error).to.equal(ConfigurationError);
                        done();
                    }
                );
            });

            describe('creates module ioc container which', function () {
                it('should provide access to module own resources', function (done) {
                    this.app.run().then(
                        (app) => {
                            let { ioc } = app.moduleInstance('MainModule');
                            let mainService = ioc.resolve('mainService');

                            expect(mainService).to.be.instanceOf(MainService);
                            expect(mainService.config).to.equal(config);
                            expect(mainService.logger).to.be.instanceOf(Logger);

                            done();
                        }
                    ).catch(done);
                });

                it('should provide access to module dependencies resource', function (done) {
                    this.app.run().then(
                        (app) => {
                            let { ioc } = app.moduleInstance('MainModule');
                            let config = ioc.resolve('config');
                            let logger = ioc.resolve('logger');

                            expect(config).to.equal(config);
                            expect(logger).to.be.instanceOf(Logger);

                            done();
                        }
                    ).catch(done);
                });

                it('should not provide access to resource of not own dependencies', function (done) {
                    this.app.run().then(
                        (app) => {
                            let { ioc } = app.moduleInstance('MainModule');

                            expect(ioc.has('console')).to.be.false;

                            done();
                        }
                    ).catch(done);
                });
            });
        });

        describe('on running phase', function () {

            it('should call method run of module on application run', function (done) {
                this.app.run().then(
                    (app) => {
                        let mainModule = app.moduleInstance('MainModule');

                        expect(mainModule.running).to.be.true;
                        done();
                    }
                ).catch(done);
            });

            it('should wait until custom running of module will not resolve promise', function (done) {
                var app = new Application();

                app.module(LazyModuleStub).run().then(
                    (app) => {
                        let module = app.moduleInstance('LazyModuleStub');
                        expect(module.running).to.be.true;
                        done();
                    }
                ).catch(done);
            });

            it('should fail application run in case if some module fails run', function (done) {
                var app = new Application();

                app.module(LazyFailedRunModule).run().then(
                    () => {
                        done(new Error("Application with failed module run successfully ran!"));
                    }
                ).catch(
                    (error) => {
                        expect(error).to.equal(RunningError);
                        done();
                    }
                );
            });
        });
    });
    
    describe('with shared resource', function () {

        it('should provide access for all modules to use shared resources', function (done) {
            const SOME_ENVIRONMENT_DATA = {
                RAW_CONFIG: {},
                INITIAL_STATE: {}
            };

            let app = new Application({
                resources: { SOME_ENVIRONMENT_DATA }
            });

            app.module(ModuleStub).run().then(
                (app) => {
                    let { ioc } = app.moduleInstance('ModuleStub');

                    expect(ioc.resolve('SOME_ENVIRONMENT_DATA')).to.equal(SOME_ENVIRONMENT_DATA);
                    done();
                }
            ).catch(done);
        });
    });
});

