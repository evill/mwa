import { ModuleStub } from './module.stub';
import { ConfigurationError, RunningError } from './errors.dummy';


export class LazyModuleStub extends ModuleStub {
    static $moduleName = 'LazyModuleStub';
    
    configure(...args) {
        return new Promise((resolve) => {
            setTimeout(() => {
                super.configure(...args);
                resolve();
            }, 1)
        });
    }
    run(...args) {
        return new Promise((resolve) => {
            setTimeout(() => {
                super.run(...args);
                resolve();
            }, 1)
        });
    }
}

export class LazyFailedConfigurationModule extends LazyModuleStub {
    static $moduleName = 'LazyFailedConfigurationModule';
    
    configure(...args) {
        return super.configure(...args).then(() => Promise.reject(ConfigurationError))
    }
}

export class LazyFailedRunModule extends LazyModuleStub {
    static $moduleName = 'LazyFailedRunModule';
    
    run(...args) {
        return super.run(...args).then(() => Promise.reject(RunningError))
    }
}

