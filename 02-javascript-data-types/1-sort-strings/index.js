/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    const copyArr = [...arr];
    if (param !== 'asc' && param !== 'desc') {
        return copyArr;
    }
    const props = [['ru', 'en'], { sensitivity: 'variant', caseFirst: 'upper' }];
    return copyArr.sort(function(a, b) {
        if (param == 'asc') { 
            return a.localeCompare(b, ...props);
        } else if (param == 'desc') {
            return b.localeCompare(a, ...props);
        }
    });
}