/* eslint-disable no-console */
import rimraf from 'rimraf';

console.log('clean .blocklet folder');
rimraf.sync('.blocklet');
rimraf.sync('api/dist');
console.log('clean .blocklet folder done!');
