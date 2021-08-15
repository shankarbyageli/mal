const { Symbol } = require("./types");

class Env {
  constructor(outer, binds=[], exprs=[]) {
    this.outer = outer;
    this.data = {};
    for (let i = 0; i < binds.length; i++) {
      if (binds[i] instanceof Symbol)
        this.set(binds[i], exprs[i])
      else
        throw new Error("expected symbol but found: " + binds[i]);
    };
  }

  set(key, value) {
    this.data[key.name] = value;
    return value;
  }

  find(key) {
    const symbol = key.name;
    if (this.data[symbol] !== undefined) {
      return this;
    }
    if (!this.outer) {
      return null;
    }
    return this.outer.find(key);
  }

  get(key) {
    const env = this.find(key);
    if (env)
      return env.data[key.name]
  }
}

module.exports = { Env };
