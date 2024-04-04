class Validations {
  static isDefined({ args, allowNull }) {
    // return args.every((arg) => arg !== undefined && allowNull && args !== null);
    return !args.some((arg) => arg === undefined || (allowNull && arg === null));
  }

  static isTypeString(...args) {}

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
