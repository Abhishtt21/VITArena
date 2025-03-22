##USER_CODE_HERE##

const input = require('fs').readFileSync('/dev/problems/hello/tests/inputs/##INPUT_FILE_INDEX##.txt', 'utf8').trim().split('\n').join(' ').split(' ');
const a = parseInt(input.shift());
const result = hello(a);
console.log(result);
    