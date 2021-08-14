class List {
  constructor(ast) {
    this.ast = ast;
  }

  isEmpty() {
    return this.ast.length === 0;
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
  constructor(ast) {
    this.data = new Map();
    for (let i = 0; i < ast.length; i += 2) {
      this.data.set(ast[i], ast[i + 1]);
    }
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

module.exports = { List, Vector, Str, Symbol, HashMap, Keyword, Nil }
