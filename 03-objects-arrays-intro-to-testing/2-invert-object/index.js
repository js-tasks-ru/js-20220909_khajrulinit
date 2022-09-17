/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
    if (!obj) {
        return undefined;
    }
    
    const invertedObj = {};
    const arr = Object.entries(obj);
    for (let item of arr) {
        const [key, val] = item;
        invertedObj[val] = key;
    }

    return invertedObj;
}
