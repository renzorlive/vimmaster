/**
 * Recursively freezes an object to prevent any runtime mutations.
 * 
 * @param {Object} obj - The object to freeze.
 * @returns {Object} The frozen object.
 */
export function deepFreeze(obj) {
    if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach(prop => {
            const val = obj[prop];
            if (val !== null && (typeof val === 'object' || typeof val === 'function') && !Object.isFrozen(val)) {
                deepFreeze(val);
            }
        });
        return Object.freeze(obj);
    }
    return obj;
}
