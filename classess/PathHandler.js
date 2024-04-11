import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Validations from './Validations.js';

class PathHandler {
  static __dirname = path.dirname(path.resolve(fileURLToPath(import.meta.url), '..'));
  static __project_root = path.dirname(this.getPathTo('package.json', process.argv0));
  static __componets_dir = this.createPathInProject('src/componets');
  static __component_template_path = this.createPathInPackage('template.js');

  static insideProject() {
    return this.__project_root !== process.env.USERPROFILE && this.__project_root !== process.env.HOME;
  }

  static createPathInProject(query) {
    return path.join(this.__project_root, query);
  }

  static createPathInPackage(query) {
    return path.join(this.__dirname, query);
  }

  static createPathInComponent(componentName, query) {
    return path.join(this.__componets_dir, componentName, query);
  }

  static createProjectRelativePath(dest) {
    // truncate full path "C:/Users/user/foo/project/src/component"
    // to project rool ".../project/src/component"

    if (!Validations.isString(dest)) return null;
    if (!path.isAbsolute(dest)) dest = this.createPathInProject(dest);
    return dest.replace(path.dirname(this.__project_root), '...');
  }

  /**
   * Returns a path from @param from to @param query if it exists
   */
  static getPathTo(query, from) {
    const _path = this.createPathTo(query, from);

    if (fs.existsSync(_path)) return _path;
    return null;
  }

  /**
   * Creates a path from @param from to @param query
   */
  static createPathTo(query, from) {
    Validations.isString(query, from);
    let path_toquery = from ?? this.__dirname;

    for (let iter = 0; iter < 100; iter++) {
      if (fs.existsSync(path.join(path_toquery, query))) break;
      path_toquery = path.resolve(path_toquery, '..');
    }

    return path.join(path_toquery, query);
  }
}

export default PathHandler;
