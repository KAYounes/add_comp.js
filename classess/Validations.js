class Validations {
  static isUndefined(args) {
    return !args.some((arg) => arg === undefined);
  }

  static isNull(...args) {
    return !args.some((arg) => arg === null);
  }

  static isDefined(...args) {
    return !args.some((arg) => arg === undefined && arg === null);
  }

  static isString(...args) {
    return args.every((arg) => typeof arg === 'string');
  }

  static isBoolean(...args) {
    return args.every((arg) => typeof arg === 'boolean');
  }

  static isObjectEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  static isObject(query) {
    if (!query || typeof query !== 'object') {
      return false;
    }
    const prototype = Object.getPrototypeOf(query);
    return prototype === null || prototype === Object.getPrototypeOf({});
  }

  static hasKeys(object, keys) {
    return this.areArraysEqual(Object.keys(object), keys);
  }

  static isArray(query) {
    return Array.isArray(query);
  }

  static areArraysEqual(alpha, beta) {
    if (!this.isArray(alpha) || !this.isArray(beta)) return false;
    if (alpha.length !== beta.length) return false;

    for (let i in alpha) {
      if (alpha[i] != beta[i]) return false;
    }

    return true;
  }
}

export default Validations;
