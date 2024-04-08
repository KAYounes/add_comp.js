import chalk from 'chalk';
import { Option } from 'commander';
import fs from 'fs';
import path from 'path';

import CLIHandler from './CLIHandler.js';
import PathHandler from './PathHandler.js';
import Validations from './Validations.js';

class Configuration {
  #CONFIGURATION_ITEMS = [
    new ConfigurationItem({
      itemKey: 'CREATE_CSS_FILE',
      defaultValue: true,
      cliOption: new Option('-s, --add-css'),
      negateCLIOption: true,
    }),
    new ConfigurationItem({
      itemKey: 'CREATE_CSS_FILE_AS_MODULE',
      defaultValue: true,
      cliOption: new Option('-m, --css-as-module'),
      negateCLIOption: true,
    }),
    new ConfigurationItem({
      itemKey: 'CREATE_COMPONENT_INDEX',
      defaultValue: true,
      cliOption: new Option('-i --create-index'),
      negateCLIOption: true,
    }),
    new ConfigurationItem({
      itemKey: 'ADD_CHILDREN_PROPS',
      defaultValue: false,
      cliOption: new Option('-c --add-children-props'),
      negateCLIOption: true,
    }),
    new ConfigurationItem({
      itemKey: 'ADD_USE_CLIENT_DIRECTIVE',
      defaultValue: false,
      cliOption: new Option('-u --add-use-client'),
      negateCLIOption: true,
    }),
    new ConfigurationItem({
      itemKey: 'USE_INLINE_EXPORT',
      defaultValue: false,
      cliOption: new Option('-l --use-inline-export'),
      negateCLIOption: true,
    }),
    new ConfigurationItem({
      itemKey: 'ADD_X_TO_EXTENSION',
      defaultValue: false,
      cliOption: new Option('-x --add-x'),
      negateCLIOption: true,
    }),
    new ConfigurationItem({
      itemKey: 'CSS_FILE_NAME',
      defaultValue: 'COMPONENT_NAME',
      cliOption: new Option('-n --css-name [name]').preset('COMPONENT_NAME'),
    }),
    new ConfigurationItem({
      itemKey: 'COMPONENT_FILE_EXTENSION',
      defaultValue: 'js',
      cliOption: new Option('-e --file-ext <ext>'),
    }),
    new ConfigurationItem({
      itemKey: 'DASH_REPLACEMENT',
      defaultValue: null,
      cliOption: new Option('-r --dash-replacement <replacement>'),
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

    await this.#readProjectConfig();
  }

  getMergedConfiguration() {
    return {
      ...this.#getDefualtConfigurations(),
      ...this.#getProjectConfigurations(),
      ...this.#getCLIConfigurations(),
    };
  }

  #getDefualtConfigurations() {
    return this.#DEFAULT_CONFIG;
  }

  #getCLIConfigurations() {
    const CLI_CONFIGS_UNMAPPED = this.#CLIConfigs.getOptions();

    const CLI_CONFIGS = {};

    for (let configurationItem of this.#CONFIGURATION_ITEMS) {
      if (configurationItem.CLI_OPTION_KEY in CLI_CONFIGS_UNMAPPED)
        CLI_CONFIGS[configurationItem.ITEM_KEY] = CLI_CONFIGS_UNMAPPED[configurationItem.CLI_OPTION_KEY];
    }

    return CLI_CONFIGS;
  }

  #getProjectConfigurations() {
    const projectConfiguration = {};

    for (let key of this.#CONFIG_ITEMS_KEYS) {
      if (key in this.#projectConfig.CONFIGS) projectConfiguration[key] = this.#projectConfig.CONFIGS[key];
    }

    return projectConfiguration;
  }

  async #readProjectConfig() {
    await this.#projectConfig.load();
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
    const CONFIG_FILE_NAME = 'make_comp.config.js';

    const PATH_TO_CONFIG_FILE = PathHandler.getPathTo(CONFIG_FILE_NAME);

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

class ConfigurationItem {
  constructor({ itemKey, defaultValue, cliOption, negateCLIOption }) {
    if (!Validations.isDefined({ args: [itemKey, defaultValue, cliOption], allowNull: false })) {
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
    if (!Validations.isDefined({ args: [this.CLI_OPTION], allowNull: false })) {
      throw Error(chalk.red('Cannot negate option, as option is not defined'));
    }

    let { short, long } = this.CLI_OPTION;
    short = short.trim().replace(/^-/, '-no-');
    long = long.trim().replace(/^--/, '--no-');
    let flag = `${short}, ${long}`;
    return new Option(flag);
  }
}

export { Configuration };
