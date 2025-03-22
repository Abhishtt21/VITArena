##USER_CODE_HERE##

const input = require('fs').readFileSync('/dev/problems/sample/tests/inputs/##INPUT_FILE_INDEX##.txt', 'utf8').trim().split('\n').join(' ').split(' ');
const arr = parseInt(input.shift());
const result = example(arr);
console.log(result);
    