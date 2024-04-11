import chalk from 'chalk';
import { Option } from 'commander';
import fs from 'fs';

import CLIHandler from './CLIHandler.js';
import PathHandler from './PathHandler.js';
import Validations from './Validations.js';

class Configuration {
  #CONFIGURATION_ITEMS = [
    new ConfigurationItem({
      itemKey: 'CREATE_CSS_FILE',
      defaultValue: true,
      cliOption: new Option('-s, --add-css', 'Create a CSS file'),
      negateCLIOption: true,
    }),
    new ConfigurationItem({
      itemKey: 'CREATE_CSS_FILE_AS_MODULE',
      defaultValue: true,
      cliOption: new Option('-m, --css-as-module', 'Create css file as a .module.css file'),
      negateCLIOption: true,
    }),
    new ConfigurationItem({
      itemKey: 'CREATE_COMPONENT_INDEX',
      defaultValue: true,
      cliOption: new Option('-i --create-index', "Create the component's index.js file"),
      negateCLIOption: true,
    }),
    new ConfigurationItem({
      itemKey: 'ADD_CHILDREN_PROPS',
      defaultValue: false,
      cliOption: new Option('-c --add-children-props', "Deconstruct children from component's props"),
      negateCLIOption: true,
    }),
    new ConfigurationItem({
      itemKey: 'ADD_USE_CLIENT_DIRECTIVE',
      defaultValue: false,
      cliOption: new Option('-u --add-use-client', 'Add "use clinet" directive to component'),
      negateCLIOption: true,
    }),
    new ConfigurationItem({
      itemKey: 'USE_INLINE_EXPORT',
      defaultValue: false,
      cliOption: new Option('-l --use-inline-export', 'Export component function with declaration'),
      negateCLIOption: true,
    }),
    new ConfigurationItem({
      itemKey: 'ADD_X_TO_EXTENSION',
      defaultValue: false,
      cliOption: new Option('-x --add-x', 'Append x to component file extension'),
      negateCLIOption: true,
    }),
    new ConfigurationItem({
      itemKey: 'CSS_FILE_NAME',
      defaultValue: 'COMPONENT_NAME',
      cliOption: new Option('-n --css-name [name]', 'CSS file name').preset('COMPONENT_NAME'),
    }),
    new ConfigurationItem({
      itemKey: 'COMPONENT_FILE_EXTENSION',
      defaultValue: 'js',
      cliOption: new Option('-e --file-ext <ext>', 'Component file extension'),
    }),
  ];

  #CONFIG_ITEMS_KEYS = [];

  #DEFAULT_CONFIG = {};

  #projectConfig = new ProjectConfigurationsHandler();

  #CLIConfigs;

  async init() {
    this.#CONFIG_ITEMS_KEYS = this.#CONFIGURATION_ITEMS.map((item) => item.ITEM_KEY);

    for (let item of this.#CONFIGURATION_ITEMS) {
      this.#DEFAULT_CONFIG[item.ITEM_KEY] = item.DEFAULT;
    }

    this.#CLIConfigs = new CLIHandler(this.#CONFIGURATION_ITEMS);

    return this.#readProjectConfig();
  }

  getConfigurationItems() {
    return this.#CONFIGURATION_ITEMS;
  }

  getMergedConfiguration() {
    return {
      ...this.getDefualtConfigurations(),
      ...this.getProjectConfigurations(),
      ...this.getCLIConfigurations(),
    };
  }

  getNameTokens() {
    return this.#CLIConfigs.getArguments();
  }

  getDefualtConfigurations() {
    return this.#DEFAULT_CONFIG;
  }

  getCLIConfigurations() {
    const CLI_CONFIGS_UNMAPPED = this.#CLIConfigs.getOptions();

    const CLI_CONFIGS = {};

    for (let configurationItem of this.#CONFIGURATION_ITEMS) {
      if (this.#validConfigValue(CLI_CONFIGS_UNMAPPED[configurationItem.CLI_OPTION_KEY]))
        CLI_CONFIGS[configurationItem.ITEM_KEY] = CLI_CONFIGS_UNMAPPED[configurationItem.CLI_OPTION_KEY];
    }

    return CLI_CONFIGS;
  }

  getProjectConfigurations() {
    const projectConfiguration = {};

    for (let key of this.#CONFIG_ITEMS_KEYS) {
      if (this.#validConfigValue(this.#projectConfig.CONFIGS[key]))
        projectConfiguration[key] = this.#projectConfig.CONFIGS[key];
    }

    return projectConfiguration;
  }

  async #readProjectConfig() {
    await this.#projectConfig.load(this.#CONFIG_ITEMS_KEYS);
  }

  #validConfigValue(value) {
    if (value === undefined) return false;
    if (value === null) return false;
    if (value === '') return false;
    if (!/[a-zA-Z$_]+[a-zA-Z0-9_$]*/.test(value)) return false;
    return true;
  }
}

class ProjectConfigurationsHandler {
  CONFIGS = {};
  CONFIG_FILE_NAME = 'addcomp.config.js';

  async load(keys) {
    return await this.#getConfigurationFileContent()
      .then((DEF) => {
        this.CONFIGS = this.#extractKeysFromConfig(keys, DEF);
        return this.CONFIGS;
      })
      .then((configs) => {
        if (Validations.isObjectEmpty(configs)) throw Error('no configurations were set');
      })
      .catch((error) => {
        throw error;
      });
  }

  #extractKeysFromConfig(keys, source) {
    return keys.reduce(function (newObj, key) {
      if (key in source) newObj[key] = source[key];
      return newObj;
    }, {});
  }

  async #getConfigurationFileContent() {
    const CONFIG_FILE_NAME = 'addcomp.config.js';

    const PATH_TO_CONFIG_FILE = PathHandler.getPathTo(CONFIG_FILE_NAME, PathHandler.__project_root);

    if (fs.existsSync(PATH_TO_CONFIG_FILE)) {
      const module_path = 'file:' + PATH_TO_CONFIG_FILE;

      return import(module_path)
        .then((module) => {
          if (!('default' in module)) {
            throw Error(`dose not export default`);
          } else if (!Validations.isObject(module.default)) {
            throw Error(`exports a non-object variable`);
          }

          return module.default;
        })
        .catch((error) => {
          throw error;
        });
    } else {
      throw Error(`file not found`);
    }
  }

  #isValidConfigurationFileContent(content, keys) {
    if (!Validations.isObject(content)) return false;
    return true;
  }
}

class ConfigurationItem {
  ITEM_KEY;
  CLI_OPTION;
  DEFAULT;
  CLI_OPTION_KEY;
  NEGATED_CLI_OPTION;

  constructor({ itemKey, defaultValue, cliOption, negateCLIOption }) {
    if (!Validations.isDefined(itemKey, defaultValue, cliOption)) {
      throw Error(chalk.red('ConfigurationItem Constructor: required parameters missing'));
    }

    this.ITEM_KEY = itemKey;
    this.CLI_OPTION = cliOption;
    if (negateCLIOption) {
      this.NEGATED_CLI_OPTION = this.#getNegatedCLIOption();
    }
    this.DEFAULT = defaultValue;
    this.CLI_OPTION_KEY = this.#getCLIOptionKey();
  }

  #getCLIOptionKey() {
    return this.CLI_OPTION.long.slice(2).replace(/-([a-zA-Z0-9])/g, (m, group) => group.toUpperCase());
  }

  #getNegatedCLIOption() {
    if (!Validations.isDefined(this.CLI_OPTION)) {
      throw Error(chalk.red('Cannot negate option, as option is not defined'));
    }

    let { short, long } = this.CLI_OPTION;
    short = short.trim().replace(/^-/, '-no-');
    long = long.trim().replace(/^--/, '--no-');
    let flag = `${short}, ${long}`;
    return new Option(flag);
  }

  getFlags() {
    return this.CLI_OPTION.short + ' ' + (this.CLI_OPTION.flags.match(/(?<=--.*)(?<=\s).*/)?.[0] ?? '');
  }

  getDescription() {
    return this.CLI_OPTION.description;
  }
}

export default Configuration;
