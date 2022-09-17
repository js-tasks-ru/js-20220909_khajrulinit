/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
    if (!string || size === 0) {
        return '';
    }
    
    if (size === undefined) {
        return string;
    }
    
    const charCounter = {};
    const charArr = [];
    
    for (let char of string) {
        charCounter[char] = (charCounter[char] || 0) + 1;
        
        const lastInd = charArr.length - 1;
        if (lastInd >= 0 && charArr[lastInd] !== char) {
            charCounter[charArr[lastInd]] = 0;
        }
        
        if (charCounter[char] <= size) {
            charArr.push(char);
        }
    }
    
    return charArr.join('');
}
