const { List, Vector, Str, Symbol, HashMap, Keyword, Nil } = require("./types");

class Reader {
  constructor(tokens) {
    this.tokens = tokens.slice();
    this.position = 0;
  }

  peek() {
    return this.tokens[this.position];
  }

  next() {
    const currToken = this.peek();
    this.position += 1;
    if (currToken)
      return currToken;
  }
}

const tokenize = (string) => {
  const tokens = [];
  const re = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
  while ((token = re.exec(string)[1]) !== "") {
    if (token[0] !== ";") {
      tokens.push(token);
    }
  }
  return tokens;
};

const read_atom = (reader) => {
  const token = reader.peek();
  if (token.match(/^-?[0-9]+$/)) {
    return parseInt(token);
  }
  if (token.match(/^-?[0-9]+\.[0-9]+$/)) {
    return parseFloat(token);
  }
  if (token === "true") {
    return true;
  }
  if (token === "false") {
    return false;
  }
  if (token === "nil") {
    return new Nil();
  }
  if (token[0] === '"') {
    if (!/[^\\]"$/.test(token)) {
      throw new Error("unbalanced");
    }
    return new Str(token.substring(1, token.length - 1));
  }
  return new Symbol(token);
};

const read_sequence = (reader, closingChar) => {
  const sequence = [];
  while((token = reader.peek()) !== closingChar) {
    if (!token) {
      throw new Error("unbalanced");
    }
    sequence.push(read_form(reader));
    reader.next();
  }
  return sequence;
};

const read_list = (reader) => {
  const list = read_sequence(reader, ")");
  return new List(list);
};

const read_vector = (reader) => {
  const vector = read_sequence(reader, "]");
  return new Vector(vector);
};

const read_hashmap = (reader) => {
  const hashmap = read_sequence(reader, "}");
  if (hashmap.length % 2 !== 0) {
    throw new Error("odd number of values in hashmap")
  }
  return new HashMap(hashmap);
};

const read_form = (reader) => {
  const token = reader.peek();
  const firstChar = token[0];
  switch(firstChar) {
    case "(":
      reader.next();
      return read_list(reader);
    case "[":
      reader.next();
      return read_vector(reader);
    case "{":
      reader.next();
      return read_hashmap(reader);
    case ":":
      return new Keyword(token.slice(1));
    case "@":
      reader.next();
      return new List([new Symbol("deref"), new Symbol(reader.peek())]);
    case "'":
      reader.next();
      return new List([new Symbol("quote"), read_form(reader)]);
    case "`":
      reader.next();
      return new List([new Symbol("quasiquote"), read_form(reader)]);
    case "~":
      reader.next();
      if (token[1] === "@")
        return new List([new Symbol("splice-unquote"), read_form(reader)]);
      return new List([new Symbol("unquote"), read_form(reader)]);
    case ")":
      throw new Error("unbalanced");
    case "]":
      throw new Error("unbalanced");
    case "}":
      throw new Error("unbalanced");
  }
  return read_atom(reader);
};

const read_str = (string) => {
  const tokens = tokenize(string);
  const reader = new Reader(tokens);

  return read_form(reader);
};

module.exports = { read_str };
