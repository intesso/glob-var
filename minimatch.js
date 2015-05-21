var match = require('minimatch');

var i = 0;
console.log(++i, match('abc', '*'));
console.log(++i, match('abc/b/c', '**/d'));
console.log(++i, match('abc', '*'));
console.log(++i, match('abc', '*'));
