import { program } from 'commander';

class CLIConfigurationHandler {
  constructor(configurationItems) {
    program.argument('<name>', 'component name');

    for (let configurationItem of configurationItems) {
      program.addOption(configurationItem.CLI_OPTION);

      if (configurationItem.NEGATED_CLI_OPTION) {
        program.addOption(configurationItem.NEGATED_CLI_OPTION);
      }
    }

    program.parse();
  }

  getArguments() {
    return program.args;
  }

  getOptions() {
    return program.opts();
  }
}

export default CLIConfigurationHandler;
