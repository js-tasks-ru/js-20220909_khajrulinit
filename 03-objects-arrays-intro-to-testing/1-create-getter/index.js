/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
    const propsArr = path.split('.');
    
    return function (obj) {
        let curObj = obj;
        for (let prop of propsArr) {
            if (curObj === undefined) {
                return undefined;
            }
            curObj = curObj[prop];
        }
        
        return curObj;
    };
}
