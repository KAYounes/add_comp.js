import chalk from 'chalk';
import { Table } from 'console-table-printer';

class Exporter {
  //   constructor(component, configurations) {
  //     this.exportConfgurationMatrix(configurations);
  //   }

  static exportConfgurationMatrix(configs) {
    const CONFIG_DEFAULTS = configs.getDefualtConfigurations();
    const CONFIG_PROJECT = configs.getProjectConfigurations();
    const CONFIG_CLI = configs.getCLIConfigurations();

    const ITEMS = configs.getConfigurationItems();

    const HEADER_COLOR = (o) => chalk.yellow(o);

    const table = new Table({
      columns: [
        { name: 'option', alignment: 'left', title: HEADER_COLOR('Option') },
        { name: 'flags', alignment: 'left', title: HEADER_COLOR('Flags') },
        { name: 'description', alignment: 'left', title: HEADER_COLOR('Description') },
        { name: 'value', alignment: 'left', title: HEADER_COLOR('Value') },
        { name: 'source', alignment: 'left', title: HEADER_COLOR('Source') },
      ],
      style: {
        headerTop: {
          left: '',
          mid: '',
          right: '',
          other: chalk.gray('_'),
        },
        headerBottom: {
          left: chalk.gray('|'),
          mid: chalk.gray('|'),
          right: chalk.gray('|'),
          other: chalk.gray('='),
        },
        tableBottom: {
          left: '',
          mid: '',
          right: '',
          other: '=',
        },
        vertical: chalk.gray('|'),
      },
      colorMap: {
        gray: '\x1B[90m', // define customized color
        dimgray: '\x1B[2m\x1B[90m', // define customized color
      },
    });

    for (let item of ITEMS) {
      let row = {
        option: item.ITEM_KEY,
        flags: item.getFlags(),
        description: item.getDescription(),
        ...getSourceAndValue(item.ITEM_KEY),
      };
      table.addRow(row, { color: 'gray' });
    }

    return table.render().replace('\n', '');

    // helper
    function getSourceAndValue(key) {
      let value = CONFIG_CLI[key] ?? CONFIG_PROJECT[key] ?? CONFIG_DEFAULTS[key];
      let color = chalk.yellow;

      // replace null/undefined values with default
      value = value ?? 'defult';

      if (value === true) {
        color = chalk.green;
      } else if (value === false) {
        color = chalk.red;
      }

      if (key in CONFIG_CLI) {
        return {
          source: chalk.magenta('CLI'),
          value: color(value),
        };
      }

      if (key in CONFIG_PROJECT) {
        return { source: chalk.cyan('config'), value: color(value) };
      }

      return { source: chalk.gray('default'), value: color(value) };
    }
  }
}

export default Exporter;
