const { List, Vector, Str, Symbol, HashMap } = require("./types");

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
  if (token[0] === '"') {
    if (!/[^\\]"$/.test(token)) {
      throw new Error("Unbalanced");
    }
    return new Str(token.substring(1, token.length - 1));
  }
  return new Symbol(token);
};

const read_sequence = (reader, closingChar) => {
  const sequence = [];
  while((token = reader.peek()) !== closingChar) {
    if (!token) {
      throw new Error("Unbalanced");
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
    case ")":
      throw new Error("Unbalanced");
    case "]":
      throw new Error("Unbalanced");
    case "}":
      throw new Error("Unbalanced");
  }
  return read_atom(reader);
};

const read_str = (string) => {
  const tokens = tokenize(string);
  const reader = new Reader(tokens);

  return read_form(reader);
};

module.exports = { read_str };
