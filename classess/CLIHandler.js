import { program } from 'commander';

class CLIHandler {
  constructor(configurationItems) {
    program.argument('<tokens...>', 'component name');

    for (let configurationItem of configurationItems) {
      program.addOption(configurationItem.CLI_OPTION);

      if (configurationItem.NEGATED_CLI_OPTION) {
        program.addOption(configurationItem.NEGATED_CLI_OPTION);
      }
    }

    program.parse();
  }

  getArguments() {
    const ALL_ARGS = process.argv.slice(2);
    const INDEX_OF_FIRST_FLAG = ALL_ARGS.findIndex((e) => /^-/.test(e));
    const ARGS_BEFORE_FLAGS = ALL_ARGS.slice(0, INDEX_OF_FIRST_FLAG > 0 ? INDEX_OF_FIRST_FLAG : undefined);
    return ARGS_BEFORE_FLAGS;
  }

  getOptions() {
    return program.opts();
  }
}

export default CLIHandler;
