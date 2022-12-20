
/**
 * Random number between inclusive start and exclusive end ( to produce results between 1-5 start would be 1, end 6.
 *  If you wanted to get a random integer between 1 (and only 1) and 5, you would use 1 and 6:
 * Where:
 *   1 is the inclusive start number
 *   6 is the exclusive end number
 *
 * @param {number} start - inclusive start
 * @param {number} end - exclusive end
 * @returns {*}
 */
const randomNumber = ( start, end ) => {
    return Math.floor (Math.random() * ( Math.abs(end) - Math.abs(start)) + Math.abs(start) )
};

module.exports = {
    randomNumber
};
