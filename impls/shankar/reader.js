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
  return token;
};

const read_list = (reader) => {
  const list = [];
  while((token = reader.peek()) !== ")") {
    if (!token) {
      throw new Error("Unbalanced");
    }
    list.push(read_form(reader));
    reader.next();
  }
  return list;
};

const read_form = (reader) => {
  const token = reader.peek();
  const firstChar = token[0];
  if (firstChar === "(") {
    reader.next();
    return read_list(reader);
  }
  return read_atom(reader);
};

const read_str = (string) => {
  const tokens = tokenize(string);
  const reader = new Reader(tokens);

  return read_form(reader);
};

module.exports = { read_str };
