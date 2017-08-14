import { iocClass } from 'ioc';

export class TodoService {
    static $inject = ['config', 'rest'];

    constructor(config, rest) {
        this._config = config;
        this._rest = rest;
    }

    getTodos(from, to) {
        this._rest.get('/todos').then((todos) => {
            return todos.slice(from, to);
        });
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
    static $dependencies = ['ConfigModule', 'TransportModule'];

    static $resources = {
        rest: iocClass(TodoService)
    };
}

