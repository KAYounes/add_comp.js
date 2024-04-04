import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import path from 'path';

class PathHandler {
  static __filename = fileURLToPath(import.meta.url);
  static __dirname = path.dirname(this.__filename);
}
export default PathHandler;
