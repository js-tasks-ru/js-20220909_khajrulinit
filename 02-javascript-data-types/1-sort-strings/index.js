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
    let r, uca, ucb, ucr;
    return newArr.sort(function(a, b) {
        uca = a.toUpperCase();
        ucb = b.toUpperCase();
        if (param == 'asc') { 
            ucr = uca.localeCompare(ucb);
            r = a.localeCompare(b);
            if (ucr === r) {
                return r;
            }
            if (a[0].toUpperCase()==a[0]) {
                return -1;
            }
            if (b[0].toUpperCase()==b[0]) {
                return 1;
            }
        } else if (param == 'desc') {
            ucr = ucb.localeCompare(uca);
            r = b.localeCompare(a);
            if (ucr === r) {
                return r;
            }
            if (a[0].toUpperCase()==a[0]) {
                return 1;
            }
            if (b[0].toUpperCase()==b[0]) {
                return -1;
            }
        }
    });
}