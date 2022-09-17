/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    const copyArr = [...arr];
    if (param !== 'asc' && param !== 'desc') {
        throw new Error('Unknown direction');
    }
    return copyArr.sort(function(a, b) {
        if (param == 'asc') { 
            return compare(a, b);
        } else if (param == 'desc') {
            return compare(b, a);
        }
    });
}

const compare = (a, b) => {
    return a.localeCompare(b, ['ru', 'en'], { sensitivity: 'variant', caseFirst: 'upper' });
}