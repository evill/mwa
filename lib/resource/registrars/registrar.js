export default (resource, type, { singleton } = {}) => {
    let registrarResource = () => resource;

    switch (type) {
        case 'function':
            registrarResource.isFunction = true;
            break;
        case 'class':
            registrarResource.isClass = true;
            break;
    }
    
    if (singleton) {
        registrarResource.singleton = true;
    }

    registrarResource.isRegistrar = true;

    return registrarResource; 
};
