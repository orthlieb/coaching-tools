const bDebug = true;

export let DEBUG = {
     logType: function logType(msg, obj, ...args) {
        let cType = typeof obj;
        if (cType == 'object' && Array.isArray(obj))
            cType = 'array';
        console.log('LOGTYPE', msg, 'Type:', cType, 'Value:', obj, ...args);
       
    },
    log: function log(...args) {
        console.log(...args);
    },
    logArgs: function logArgs(msg, args) {
        console.log('LOGARGS', msg, ...args);

    }
};

function nullFunc(...args) {}

if (!bDebug) {    
    Object.keys(DEBUG).forEach((key) => {
        DEBUG[key] = nullFunc;
    });
}