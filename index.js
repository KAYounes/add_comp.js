import CLIConfigurationHandler from './classess/CommandLine.js';
import { Configuration } from './classess/Configurations.js';
import { program, Option } from 'commander';

let config = new Configuration();
await config.init();

console.log('Default');
console.table(config.getDefualtConfigurations());
console.log('\nProject');
console.table(config.getProjectConfigurations());
console.log('\nCLI');
console.table(config.getCLIConfigurations());
console.log('\nMerged');
console.table(config.getMergedConfiguration());
