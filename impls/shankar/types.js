class List {
  constructor(ast) {
    this.ast = ast;
  }

  isEmpty() {
    return this.ast.length === 0;
  }

  count() {
    return this.ast.length;
  }

  toString() {
    return "(" + this.ast.map(x => x.toString()).join(" ") + ")";
  }
}

class Vector {
  constructor(ast) {
    this.ast = ast;
  }

  isEmpty() {
    return this.ast.length === 0;
  }

  count() {
    return this.ast.length;
  }

  toString() {
    return "[" + this.ast.map(x => x.toString()).join(" ") + "]";
  }
}

class HashMap {
  constructor(ast) {
    this.data = new Map();
    for (let i = 0; i < ast.length; i += 2) {
      this.data.set(ast[i], ast[i + 1]);
    }
  }

  count() {
    return this.data.entries().length;
  }

  toString() {
    const list = [];
    for ([k, v] of this.data.entries()) {
      list.push(`${k.toString()} ${v.toString()}`);
    }
    return "{" + list.join(", ") + "}";
  }
}

class Str {
  constructor(string) {
    this.string = string;
  }

  count() {
    return this.string.length;
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

class Nil {
  count() {
    return 0;
  }

  toString() {
    return "nil";
  }
}

class Keyword {
  constructor(keyword) {
    this.keyword = keyword;
  }

  toString() {
    return ":" + this.keyword;
  }
}

class Fn {
  constructor(fn, isVariadic, ast, env, params) {
    this.fn = fn;
    this.isVariadic = isVariadic;
    this.ast = ast;
    this.env = env;
    this.params = params;
    this.isMacro = false;
  }

  apply(args) {
    return this.fn(args);
  }

  toString() {
    return "#<function>";
  }
}

class Atom {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return `(atom ${this.value})`;
  }
}

module.exports = { List, Vector, Str, Symbol, HashMap, Keyword, Nil, Fn, Atom }