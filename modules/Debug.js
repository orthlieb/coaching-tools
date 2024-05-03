const bDebug = false;

export let DEBUG = {
     logType: (msg, obj, ...args) => {
        let cType = typeof obj;
        if (cType == 'object' && Array.isArray(obj))
            cType = 'array';
        console.log('LOGTYPE', msg, 'Type:', cType, 'Value:', JSON.stringify(obj), ...args);
       
    },
    log: function (...args) {
        console.log(...args);
    }
};

function nullFunc(...args) {}

if (!bDebug) {    
    Object.keys(DEBUG).forEach((key) => {
        DEBUG[key] = nullFunc;
    });
}