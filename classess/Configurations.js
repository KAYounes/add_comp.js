import chalk from 'chalk';
import Validations from './Validations.js';
import { Option } from 'commander';
import PathHandler from './PathHandler.js';
import fs from 'fs';
import os from 'os';
import path from 'path';
import CLIConfigurationHandler from './CommandLine.js';
class Configuration {
  //   constructor() {
  //     // this.options = [
  //     //   new OptionWrapper('CREATE_CSS_FILE', new Option('-s, --add-css'), true),
  //     //   new OptionWrapper('CREATE_CSS_FILE_AS_MODULE', new Option('-m, --css-as-module'), true),
  //     //   new OptionWrapper('CREATE_COMPONENT_INDEX', new Option('-i --create-index'), true),
  //     //   new OptionWrapper('ADD_CHILDREN_PROPS', new Option('-c --add-children-props'), true),
  //     //   new OptionWrapper('ADD_USE_CLIENT_DIRECTIVE', new Option('-u --add-use-client'), true),
  //     //   new OptionWrapper('USE_INLINE_EXPORT', new Option('-l --use-inline-export'), true),
  //     //   new OptionWrapper('ADD_X_TO_EXTENSION', new Option('-x --add-x'), true),
  //     //   new OptionWrapper('CSS_FILE_NAME', new Option('-n --css-name <name>')),
  //     //   new OptionWrapper('COMPONENT_FILE_EXTENSION', new Option('-e --file-ext <ext>')),
  //     // ];
  //   }

  #OPTION_KEYS = [
    'CREATE_CSS_FILE',
    'CREATE_CSS_FILE_AS_MODULE',
    'CREATE_COMPONENT_INDEX',
    'ADD_CHILDREN_PROPS',
    'ADD_USE_CLIENT_DIRECTIVE',
    'USE_INLINE_EXPORT',
    'ADD_X_TO_EXTENSION',
    'CSS_FILE_NAME',
    'COMPONENT_FILE_EXTENSION',
  ];

  #CLI_OPTIONS = [
    new OptionWrapper('CREATE_CSS_FILE', new Option('-s, --add-css'), true),
    new OptionWrapper('CREATE_CSS_FILE_AS_MODULE', new Option('-m, --css-as-module'), true),
    new OptionWrapper('CREATE_COMPONENT_INDEX', new Option('-i --create-index'), true),
    new OptionWrapper('ADD_CHILDREN_PROPS', new Option('-c --add-children-props'), true),
    new OptionWrapper('ADD_USE_CLIENT_DIRECTIVE', new Option('-u --add-use-client'), true),
    new OptionWrapper('USE_INLINE_EXPORT', new Option('-l --use-inline-export'), true),
    new OptionWrapper('ADD_X_TO_EXTENSION', new Option('-x --add-x'), true),
    new OptionWrapper('CSS_FILE_NAME', new Option('-n --css-name <name>')),
    new OptionWrapper('COMPONENT_FILE_EXTENSION', new Option('-e --file-ext <ext>')),
  ];

  projectConfig = new ProjectConfigurationsHandler();
  CLIConfigs = new CLIConfigurationHandler(this.#CLI_OPTIONS);

  getMergedConfiguration() {
    return {
      ...this.getDefualtConfigurations(),
      ...this.getProjectConfigurations(),
      ...this.getCLIConfigurations(),
    };
  }

  getDefualtConfigurations() {
    return {
      CREATE_CSS_FILE: true,
      CREATE_CSS_FILE_AS_MODULE: true,
      CREATE_COMPONENT_INDEX: true,
      ADD_CHILDREN_PROPS: false,
      ADD_USE_CLIENT_DIRECTIVE: false,
      USE_INLINE_EXPORT: false,
      ADD_X_TO_EXTENSION: false,
      CSS_FILE_NAME: 'COMPONENT_NAME',
      COMPONENT_FILE_EXTENSION: 'js',
    };
  }

  getCLIConfigurations() {
    const CLI_CONFIGS_UNMAPPED = this.CLIConfigs.getOptions();

    const CLI_CONFIGS = {};
    for (let option of this.#CLI_OPTIONS) {
      if (option.OPTION_KEY in CLI_CONFIGS_UNMAPPED)
        CLI_CONFIGS[option.VARIABLE_KEY] = CLI_CONFIGS_UNMAPPED[option.OPTION_KEY];
    }

    return CLI_CONFIGS;
  }

  getProjectConfigurations() {
    const projectConfiguration = {};

    for (let key of this.#OPTION_KEYS) {
      if (key in this.projectConfig.CONFIGS) projectConfiguration[key] = this.projectConfig.CONFIGS[key];
    }

    return projectConfiguration;
  }

  async readProjectConfig() {
    await this.projectConfig.load();
  }
}

class ProjectConfigurationsHandler {
  PROJECT_CONFIG_EXISTS = false;
  CONFIGS = {};

  async load() {
    const CONTENT = await this.#getConfigurationFileContent();
    const IS_VALID = this.#isValidConfigurationFileContent(CONTENT);
    this.PROJECT_CONFIG_EXISTS = IS_VALID;
    if (IS_VALID) this.CONFIGS = CONTENT;
  }

  async #getConfigurationFileContent() {
    // let project_root = PathHandler.__dirname;
    let project_root =
      'C:\\Users\\kayeg\\Documents\\Main Folders\\f.c__coding\\web_programming\\npm_packages\\gen_rcomp\\node_modules\\package';

    const CONFIG_FILE_NAME = 'make_comp.config.js';

    // look for file in current directory
    if (fs.existsSync(path.join(PathHandler.__dirname, CONFIG_FILE_NAME))) {
      project_root = PathHandler.__dirname;
    } else {
      // set project_root to parent directory of node_modules
      // for-loop as fail safe to avoid infinite loops
      for (let i = 0; i < 100; i++) {
        let found_node_modules = path.basename(project_root) == 'node_modules';
        project_root = path.resolve(project_root, '..');
        if (found_node_modules) break;
      }

      //   project_root = path.resolve(cwd, '..');
    }

    const PATH_TO_CONFIG_FILE = path.join(project_root, CONFIG_FILE_NAME);

    if (fs.existsSync(PATH_TO_CONFIG_FILE)) {
      const module_path = 'file:' + PATH_TO_CONFIG_FILE;
      return await import(module_path).then((module) => module.default);
    }
  }

  #isValidConfigurationFileContent(content, keys) {
    if (!Validations.isObject(content)) return false;
    return true;
    // Validations.hasKeys(content, keys);
  }
}

class OptionWrapper {
  constructor(variable_key, option, negateableOption, default_value) {
    if (!Validations.isDefined({ args: [variable_key, option], allowNull: false })) {
      throw Error(chalk.red('Option Constructor: option_name, option are required parameters'));
    }

    this.VARIABLE_KEY = variable_key;
    this.OPTION_OBJECT = option;
    if (negateableOption) {
      this.NEGATED_OPTION_OBJECT = this.negateOption();
    }
    this.default = default_value;
    this.OPTION_KEY = this.OPTION_OBJECT.long.slice(2).replace(/-([a-zA-Z0-9])/g, (m, group) => group.toUpperCase());
  }

  negateOption() {
    if (!Validations.isDefined({ args: [this.OPTION_OBJECT], allowNull: false })) {
      throw Error(chalk.red('Cannot negate option, as option is not defined'));
    }

    let { short, long } = this.OPTION_OBJECT;
    short = short.trim().replace(/^-/, '-no-');
    long = long.trim().replace(/^--/, '--no-');
    let flag = `${short}, ${long}`;
    return new Option(flag);
  }
}

export { Configuration };
