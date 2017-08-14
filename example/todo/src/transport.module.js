import { iocClass } from 'ioc';

export class RestService {
    static $inject = ['config'];

    constructor(config) {
        this._config = config;
    }

    todoList = [
        { id: 1, todo: 'Todo 1'},
        { id: 2, todo: 'Todo 2'},
        { id: 3, todo: 'Todo 2'},
        { id: 5, todo: 'Todo 2'},
        { id: 6, todo: 'Todo 2'},
        { id: 7, todo: 'Todo 2'}
    ];
    
    get(url) {
        let result = this._get(url);
        
        if (result instanceof Error) {
            return Promise.reject(result);
        }
        
        return Promise.resolve(resolve);
    }
    
    _get(url) {
        switch (url) {
            case '/todos':
                return this._config.todoList;
            case '/todos/1':
            case '/todos/2':
            case '/todos/3':
            case '/todos/4':
            case '/todos/5':
            case '/todos/6':
            case '/todos/7':
                let id = url.slice(-1);
                return this._config.todoList.find( (todo) => todo.id === id);
            default:
                return new Error('Not Found!');
        }        
    }
}


export class TransportModule {
    static $dependencies = ['ConfigModule'];
    
    static $resources = {
        rest: iocClass(RestService)
    };
}

