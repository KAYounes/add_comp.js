import { Configuration } from './classess/Configurations.js';

let config = new Configuration();
await config.init();

console.log('Default');
console.log('\nMerged');
console.table(config.getMergedConfiguration());
