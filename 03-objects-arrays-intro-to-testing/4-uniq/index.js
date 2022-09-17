/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
    if (!arr?.length) {
        return [];
    }
    
    const set = new Set();
    
    return arr.reduce((acc, cur) => {
        if (!set.has(cur)) {
            set.add(cur);
            acc.push(cur);
        }
        
        return acc;
    }, []);
}
