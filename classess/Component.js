import fs from 'fs';
import os from 'os';
import sanitize from 'sanitize-filename-truncate';

class Component {
  COMPONENT_NAME;
  FILE_NAME;
  CSS_FILE_NAME;
  #CREATE_CONFIG = {};
  #COMPONENT_CONTENT = '';

  constructor(name_tokens, configurations) {
    const {
      CREATE_CSS_FILE,
      CREATE_CSS_FILE_AS_MODULE,
      CREATE_COMPONENT_INDEX,
      ADD_CHILDREN_PROPS,
      ADD_USE_CLIENT_DIRECTIVE,
      USE_INLINE_EXPORT,
      ADD_X_TO_EXTENSION,
      CSS_FILE_NAME,
      COMPONENT_FILE_EXTENSION,
      DASH_REPLACEMENT,
    } = configurations;

    this.#CREATE_CONFIG = {
      CREATE_CSS_FILE,
      CREATE_COMPONENT_INDEX,
      ADD_CHILDREN_PROPS,
      ADD_USE_CLIENT_DIRECTIVE,
      USE_INLINE_EXPORT,
    };
    this.COMPONENT_NAME = this.#parseNameTokens(name_tokens);
    this.FILE_NAME = `${this.COMPONENT_NAME}.${COMPONENT_FILE_EXTENSION}${ADD_X_TO_EXTENSION ? 'x' : ''}`;
    this.CSS_FILE_NAME = this.#createCSSFileName(CSS_FILE_NAME, CREATE_CSS_FILE_AS_MODULE, DASH_REPLACEMENT);
  }

  #parseNameTokens(tokens, DASH_REPLACEMENT) {
    const sanitized_tokens = tokens.map((element) => {
      return this.#santizeString(element, DASH_REPLACEMENT);
    });

    return this.#toCamelCase(sanitized_tokens.join(' '), true);
  }

  #santizeString(value, DASH_REPLACEMENT) {
    // handle ?/string expanding as a path (happens with git bash on windows when ?/string is typed)
    // extracts from C:/Program Files/Program Files/Git '?C:/Program Files/Program Files/Git/string'
    const path_expansion = value.match(/(?<=\?)(.*)(?=\/)/)?.[0];
    if (fs.existsSync(path_expansion)) {
      value = value.replace(path_expansion, '');
    }

    // replace '-' with replacement if defined, else keep '-'
    if (DASH_REPLACEMENT) {
      value = value.replaceAll('-', DASH_REPLACEMENT);
    }

    // replace invalid characters with -, including space
    value = sanitize(value, {
      replacement: () => '-',
      convertWhiteSpace: '-',
    });

    // replace '-' between words with space " "
    // so later on it this foo-fee, foo--fee, ... will become fooFee
    value = value.replaceAll(/(?<=\w)-+(?=\w)/g, ' ');

    // remove remaing "-"
    value = value.replaceAll('-', '');

    return value;
  }

  #toCamelCase(string, capitalizeFirstWord) {
    // convert to camelCase by space " "
    string = string.split(' ').reduce(function (acc, val, index) {
      return acc + val.replace(/^./, (m) => m.toUpperCase());
    }, '');

    if (!capitalizeFirstWord) return string.replace(/^./, (m) => m.toLowerCase());
    return string;
  }

  #createCSSFileName(CSS_FILE_NAME, CREATE_CSS_FILE_AS_MODULE, DASH_REPLACEMENT) {
    let name = this.COMPONENT_NAME;

    if (CSS_FILE_NAME !== 'COMPONENT_NAME') {
      name = this.#santizeString(CSS_FILE_NAME, DASH_REPLACEMENT);
    }
    return `${this.#toCamelCase(name, false)}${CREATE_CSS_FILE_AS_MODULE ? '.module' : ''}.css`;
  }

  create(template) {
    this.#COMPONENT_CONTENT = template;
    this.#handleClientDirective();
    this.#handleChildrenProps();
    this.#handleExport();
    this.#handleCSSImport();
    this.#handleComponentName();
  }

  #handleComponentName() {
    this.#updateComponent(this.#COMPONENT_CONTENT.replaceAll('COMPONENT_NAME', this.COMPONENT_NAME));
  }

  #handleCSSImport() {
    // const import_line_index = this.#splitByLine().findIndex((element) => element.includes('CSS_FILE_NAME'));
    const target_indecies = this.#getIndeciesContains('CSS_FILE_NAME');

    if (this.#CREATE_CONFIG.CREATE_CSS_FILE) {
      this.#updateComponent(this.#COMPONENT_CONTENT.replace('CSS_FILE_NAME', this.CSS_FILE_NAME));
    } else {
      this.#removeFromComponent(target_indecies, 1);
    }
  }

  // #handleIndexFile() {}

  #handleChildrenProps() {
    const target_indecies = this.#getIndeciesContains('CHILDREN_PROPS');

    if (this.#CREATE_CONFIG.ADD_CHILDREN_PROPS) {
      this.#updateComponent(this.#COMPONENT_CONTENT.replaceAll('{ CHILDREN_PROPS }', '{ children }'));
    } else {
      this.#updateComponent(this.#COMPONENT_CONTENT.replaceAll('{ CHILDREN_PROPS }', '{}'));
      this.#removeFromComponent(target_indecies.at(-1), 1);
    }
  }

  #handleClientDirective() {
    if (!this.#CREATE_CONFIG.ADD_USE_CLIENT_DIRECTIVE) return;
    this.#addToComponent(0, '"use client"');
  }

  #handleExport() {
    const target_indecies = this.#getIndeciesContains('export default');

    if (this.#CREATE_CONFIG.USE_INLINE_EXPORT) {
      // order matters
      this.#removeFromComponent(target_indecies[1], 1);
      this.#removeFromComponent(target_indecies[0] + 1, 1);
    } else {
      this.#removeFromComponent(target_indecies[0], 1);
    }
  }

  #getIndeciesContains(query) {
    const lines = this.#splitByLine();
    const indices = [];

    lines.forEach(function (line, i) {
      if (line.includes(query)) indices.push(i);
    });
    return indices;
  }

  #splitByLine() {
    return this.#COMPONENT_CONTENT.split(os.EOL);
  }

  #joinByLine(lines) {
    return lines.join(os.EOL);
  }

  #addToComponent(line, content) {
    let lines = this.#splitByLine();
    lines.splice(line, 0, content);
    this.#COMPONENT_CONTENT = this.#joinByLine(lines);
  }

  #removeFromComponent(line, count) {
    let lines = this.#splitByLine();
    lines.splice(line, count ?? 1);
    this.#COMPONENT_CONTENT = this.#joinByLine(lines);
  }

  #updateComponent(content) {
    this.#COMPONENT_CONTENT = content;
  }

  getContent() {
    return this.#COMPONENT_CONTENT;
  }
}

export default Component;
