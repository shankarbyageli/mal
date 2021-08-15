class Env {
  constructor(outer) {
    this.outer = outer;
    this.data = {};
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
