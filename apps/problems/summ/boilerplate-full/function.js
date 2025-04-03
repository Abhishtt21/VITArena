##USER_CODE_HERE##

const input = require('fs').readFileSync('/dev/problems/sum/tests/inputs/##INPUT_FILE_INDEX##.txt', 'utf8').trim().split('\n').join(' ').split(' ');
const a = parseInt(input.shift());
const result = summm(a);
console.log(result);
    