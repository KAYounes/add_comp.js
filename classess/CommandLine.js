import { program } from 'commander';

class CLIConfigurationHandler {
  constructor(optionWrappers) {
    program.argument('<name>', 'component name');

    for (let optionWrapper of optionWrappers) {
      program.addOption(optionWrapper.OPTION_OBJECT);
      if (optionWrapper.NEGATED_OPTION_OBJECT) {
        program.addOption(optionWrapper.NEGATED_OPTION_OBJECT);
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
