import CLIConfigurationHandler from './classess/CommandLine.js';
import { Configuration } from './classess/Configurations.js';
import { program, Option } from 'commander';

// let addCSSOption = new OptionWrapper('CREATE_CSS_FILE', new Option('-s, --add-css'), true);
// let createCSSFileAsModuleOption = new OptionWrapper(
//   'CREATE_CSS_FILE_AS_MODULE',
//   new Option('-m, --css-as-module'),
//   true,
// );
// let createComponentIndexOption = new OptionWrapper('CREATE_COMPONENT_INDEX', new Option('-i --create-index'), true);
// let addChildrenPropsOption = new OptionWrapper('ADD_CHILDREN_PROPS', new Option('-c --add-children-props'), true);
// let addUseClientDirectiveOption = new OptionWrapper(
//   'ADD_USE_CLIENT_DIRECTIVE',
//   new Option('-u --add-use-client'),
//   true,
// );
// let useInlineExportOption = new OptionWrapper('USE_INLINE_EXPORT', new Option('-l --use-inline-export'), true);
// let addXToExtensionOption = new OptionWrapper('ADD_X_TO_EXTENSION', new Option('-x --add-x'), true);
// let cssFileNameOption = new OptionWrapper('CSS_FILE_NAME', new Option('-n --css-name <name>'));
// let componentFileExtensionOption = new OptionWrapper('COMPONENT_FILE_EXTENSION', new Option('-e --file-ext <ext>'));

let config = new Configuration();
await config.readProjectConfig();
console.log('Default');
console.table(config.getDefualtConfigurations());
console.log('\nCLI');
console.table(config.getCLIConfigurations());
console.log('\nProject');
console.table(config.getProjectConfigurations());
console.log('\nMerged');
console.table(config.getMergedConfiguration());
