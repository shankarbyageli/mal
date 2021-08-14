class List {
  constructor(ast) {
    this.ast = ast;
  }

  toString() {
    return "(" + this.ast.map(x => x.toString()).join(" ") + ")";
  }
}

class Vector {
  constructor(ast) {
    this.ast = ast;
  }

  toString() {
    return "[" + this.ast.map(x => x.toString()).join(" ") + "]";
  }
}

class HashMap {
  constructor(values) {
    this.values = values;
  }

  toString() {
    return "{" + this.values.map(x => x.toString()).join(" ") + "}";
  }
}

class Str {
  constructor(string) {
    this.string = string;
  }

  toString() {
    return '"' + this.string + '"';
  }
}

class Symbol {
  constructor(name) {
    this.name = name;
  }

  toString() {
    return this.name.toString();
  }
}

module.exports = { List, Vector, Str, Symbol, HashMap }
