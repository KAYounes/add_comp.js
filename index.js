import fs from 'fs';
import os from 'os';

import { Configuration } from './classess/Configurations.js';
import PathHandler from './classess/PathHandler.js';
import path from 'path';
import Component from './classess/Component.js';

let config = new Configuration();
await config.init();
const configs = config.getMergedConfiguration();

console.log('\nMerged');
console.table(configs);

// Create ./src/componets directory
fs.mkdirSync(PathHandler.__componets_dir, { recursive: true });

const component = new Component(config.getNameTokens(), configs);
// console.log(component.COMPONENT_NAME);

const component_tempalte = fs.readFileSync(PathHandler.createPathInPackage('template.js'), { encoding: 'utf-8' });
component.create(component_tempalte);
// console.log(component.getContent());

const INDEX_FILE_PATH = PathHandler.createPathInComponent(component.COMPONENT_NAME, 'index.js');
const COMP_FILE_PATH = PathHandler.createPathInComponent(component.COMPONENT_NAME, component.FILE_NAME);
const CSS_FILE_PATH = PathHandler.createPathInComponent(component.COMPONENT_NAME, component.CSS_FILE_NAME);

// create directories src/components/COMPONENT_NAME
const COMPONENT_DIR_PATH = path.join(PathHandler.__componets_dir, component.COMPONENT_NAME);
fs.mkdirSync(COMPONENT_DIR_PATH, { recursive: true });

// if dir not empty exit
if (fs.readdirSync(COMPONENT_DIR_PATH).length !== 0) process.exit();

// create files in dir
if (configs.CREATE_COMPONENT_INDEX) {
  const INDEX_FILE = [
    `export * from './${component.FILE_NAME}'`,
    `export { default } from './${component.FILE_NAME}'`,
  ].join(os.EOL);

  fs.writeFileSync(INDEX_FILE_PATH, INDEX_FILE, { encoding: 'utf-8' });
}

if (configs.CREATE_CSS_FILE) {
  fs.writeFileSync(CSS_FILE_PATH, '', { encoding: 'utf-8' });
}

fs.writeFileSync(COMP_FILE_PATH, component.getContent(), { encoding: 'utf-8' });
