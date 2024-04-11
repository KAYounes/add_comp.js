import chalk from 'chalk';

class Logger {
  static indentContent(content, level) {
    level = level ?? 1;
    const GAP = ' ';
    const LEVEL_LENGTH = 2;
    return content.replace(/^/gm, GAP.repeat(level * LEVEL_LENGTH));
  }

  static prefixContent(content) {
    return content.replace(/^/gm, chalk.gray('> '));
  }

  static logSection(title, color) {
    const WIDTH = 60;
    if (title.length > WIDTH - 20) throw Error('Title to long');

    const decoration = '='.repeat(WIDTH);
    const gap = ' '.repeat((WIDTH - title.length) / 2);

    color = this.#resolveColor(color);

    console.log(this.indentContent(color(`${decoration}\n${gap}${title}\n${decoration}`)));
  }

  static logAsIs(content) {
    console.log(content);
  }

  static log(content, blanks, color) {
    if (blanks) this.logBlanks(blanks);
    color = this.#resolveColor(color);
    console.log(color(this.indentContent(content)));
  }

  static logKeyValue(key, value, color) {
    color = this.#resolveColor(color);
    this.log(this.prefixContent(chalk.gray(key + ':', color(value))));
  }

  static logBlanks(count) {
    console.log(''.repeat(count ?? 1));
  }

  static #resolveColor(color) {
    return chalk?.[color] ?? chalk.gray;
  }
}

export default Logger;
