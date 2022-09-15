/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    let newArr = arr.slice(0);
    if (param !== 'asc' && param !== 'desc') {
        return newArr;
    }
    return newArr.sort(function(a, b) {
        if (param == 'asc') { 
            return a.localeCompare(b, ['ru', 'en'], { sensitivity: 'variant', caseFirst: 'upper' });
        } else if (param == 'desc') {
            return b.localeCompare(a, ['ru', 'en'], { sensitivity: 'variant', caseFirst: 'upper' });
        }
    });
}