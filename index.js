#!/usr/bin/env node
import fs from 'fs';
import os from 'os';

import path from 'path';
import Component from './classess/Component.js';
import Configuration from './classess/Configurations.js';
import Exporter from './classess/Exporter.js';
import Logger from './classess/Logger.js';
import PathHandler from './classess/PathHandler.js';

// ('PathHandler.__dirname', PathHandler.__dirname);

// process.exit();
let config = new Configuration();
const response = await config
  .init()
  .then(() => ['config file status', 'valid', 'green'])
  .catch((e) => ['config file status', e.message, 'red']);

Logger.log(Exporter.exportConfgurationMatrix(config), 1);
Logger.logSection('Logs');
Logger.logKeyValue(...response);
const configs = config.getMergedConfiguration();
Logger.logBlanks(1);

if (!PathHandler.insideProject()) {
  Logger.logSection('TERMINATING', 'red');
  Logger.logKeyValue('reason', `not inside node project (package.json not found)`, 'red');
  Logger.logBlanks(1);
  process.exit();
}

const state = [];

// Create /src/components directory
fs.mkdirSync(PathHandler.__components_dir, { recursive: true });

const component = new Component(config.getNameTokens(), configs);

const component_tempalte = fs.readFileSync(PathHandler.createPathInPackage('template.js'), { encoding: 'utf-8' });
component.create(component_tempalte, state);

const COMP_FILE_PATH = PathHandler.createPathInComponent(component.COMPONENT_NAME, component.FILE_NAME);
const INDEX_FILE_PATH = PathHandler.createPathInComponent(component.COMPONENT_NAME, 'index.js');
const CSS_FILE_PATH = PathHandler.createPathInComponent(component.COMPONENT_NAME, component.CSS_FILE_NAME);

state.push([0, 'component name', `< ${component.COMPONENT_NAME} />`]);
state.push([1, 'component file', PathHandler.createProjectRelativePath(COMP_FILE_PATH)]);
state.push([2, 'create css file', false]);
state.push([3, 'create index file', false]);

// create directories src/components/COMPONENT_NAME
const COMPONENT_DIR_PATH = path.join(PathHandler.__components_dir, component.COMPONENT_NAME);
fs.mkdirSync(COMPONENT_DIR_PATH, { recursive: true });

// if dir not empty exit
if (fs.readdirSync(COMPONENT_DIR_PATH).length !== 0) {
  const RELATIVE_PATH = PathHandler.createProjectRelativePath(`src/components/${component.COMPONENT_NAME}`);
  Logger.logSection('TERMINATING', 'red');
  Logger.logKeyValue('reason', `directory is not empty => "${RELATIVE_PATH}"`, 'yellow');
  Logger.logBlanks(1);
  process.exit();
}

//// create files in dir ////

// create index file

if (configs.CREATE_COMPONENT_INDEX) {
  const INDEX_FILE = [
    `export * from './${component.FILE_NAME}'`,
    `export { default } from './${component.FILE_NAME}'`,
  ].join(os.EOL);

  fs.writeFileSync(INDEX_FILE_PATH, INDEX_FILE, { encoding: 'utf-8' });

  state[state.findIndex((e) => e[0] === 3)] = [
    3,
    'create index file',
    PathHandler.createProjectRelativePath(INDEX_FILE_PATH),
  ];
}

// create css file
if (configs.CREATE_CSS_FILE) {
  fs.writeFileSync(CSS_FILE_PATH, '', { encoding: 'utf-8' });
  state[state.findIndex((e) => e[0] === 2)] = [
    2,
    'create css file',
    PathHandler.createProjectRelativePath(CSS_FILE_PATH),
  ];
}

// create component file
fs.writeFileSync(COMP_FILE_PATH, component.getContent(), { encoding: 'utf-8' });

const sorted_state = state.sort((a, b) => a[0] - b[0]);
for (let s of sorted_state) {
  if (s[2]) Logger.logKeyValue(s[1], s.slice(2), s.at(3) ?? 'green');
  else Logger.logKeyValue(s[1], 'false', 'red');
}

Logger.log(component.getContent(), 1, 'gray');
Logger.logBlanks(1);
Logger.logSection('finito', 'green');
Logger.logBlanks(1);
