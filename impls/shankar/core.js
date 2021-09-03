const fs = require("fs");
const { Env } = require("./env");
const { Symbol, Atom, Nil, List, Vector, Str, Fn } = require("./types");
const { pr_str } = require("./printer");
const { read_str } = require("./reader");

const core = new Env(null);

core.set(new Symbol("+"), (args) => args.reduce((r, x) => r + x, 0));
core.set(new Symbol("-"), (args) => {
  if (args.length === 0) {
    throw new Error(`wrong number of args(${args.length}) passed to : -`);
  }
  return args.reduce((r, x) => r - x);
});
core.set(new Symbol("*"), (args) => args.reduce((r, x) => r * x, 1));
core.set(new Symbol("/"), (args) => {
  if (args.length === 0) {
    throw new Error(`wrong number of args(${args.length}) passed to : /`);
  }
  return args.reduce((r, x) => r / x);
});

core.set(new Symbol("prn"), (args) => {
  const output = args[0] !== undefined ? pr_str(args[0]) : "";
  console.log(output);
  return new Nil();
});

core.set(new Symbol("println"), (args) => {
  const output = args.map(x => {
    if (x instanceof Str)
      return pr_str(x).slice(1, -1);
    return pr_str(x);
  });
  console.log(output.join(" "));
  return new Nil();
});

core.set(new Symbol("list"), (args) => {
  return new List(args);
});

core.set(new Symbol("list?"), (args) => {
  return args[0] instanceof List;
});

core.set(new Symbol("empty?"), (args) => {
  if (args[0] instanceof List || args[0] instanceof Vector)
  return args[0].isEmpty();
  throw new Error("count does not support type: " + args[0]);
});

core.set(new Symbol("count"), (args) => {
  if (args[0].count !== undefined)
    return args[0].count();
  throw new Error("count does not support type: " + args[0]);
});

core.set(new Symbol("="), (args) => {
  if (args.length === 0) 
    throw new Error(`wrong number of args(${args.length}) to: =`);
    return args.slice(0, -1).every((x, i) => x.toString() === args[i + 1].toString());
});

core.set(new Symbol(">"), (args) => {
  if (args.length === 0) 
    throw new Error(`wrong number of args(${args.length}) to: =`);
  return args.slice(0, -1).every((x, i) => x > args[i + 1]);
});

core.set(new Symbol("<"), (args) => {
  if (args.length === 0) 
    throw new Error(`wrong number of args(${args.length}) to: =`);
  return args.slice(0, -1).every((x, i) => x < args[i + 1]);
});

core.set(new Symbol(">="), (args) => {
  if (args.length === 0) 
    throw new Error(`wrong number of args(${args.length}) to: =`);
  return args.slice(0, -1).every((x, i) => x >= args[i + 1]);
});

core.set(new Symbol("<="), (args) => {
  if (args.length === 0) 
    throw new Error(`wrong number of args(${args.length}) to: =`);
  return args.slice(0, -1).every((x, i) => x <= args[i + 1]);
});

core.set(new Symbol("pr-str"), (args) => {
  const strings = args.map(x => pr_str(x).replace(/"/g, "\\\""));
  return '"' + strings.join(" ") + '"';
});

core.set(new Symbol("str"), (args) => {
  const strings = args.map(x => {
    if (x instanceof Str)
      return pr_str(x).slice(1, -1);
    return pr_str(x);
  });
  return new Str(strings.join(""));
});

core.set(new Symbol("atom"), (args) => {
  if (args.length === 0) 
    throw new Error(`wrong number of args(${args.length}) to: atom`);
    return new Atom(args[0]);
  });
  
core.set(new Symbol("atom?"), (args) => {
  if (args.length === 0) 
    throw new Error(`wrong number of args(${args.length}) to: atom?`);
  return args[0] instanceof Atom;
});
    
core.set(new Symbol("deref"), (args) => {
  if (args.length === 0) 
    throw new Error(`wrong number of args(${args.length}) to: deref`);
  if (args[0] instanceof Atom)
    return args[0].value;
  throw new Error(`Cannot deref non-atom value: ${args[0]}`);
});

core.set(new Symbol("reset!"), (args) => {
  if (args.length !== 2) 
    throw new Error(`wrong number of args(${args.length}) to: reset!`);
  if (args[0] instanceof Atom)
    return args[0].value = args[1];
  throw new Error(`Cannot reset non-atom value: ${args[0]}`);
});

core.set(new Symbol("swap!"), (args) => {
  if (args.length < 2) 
    throw new Error(`wrong number of args(${args.length}) to: swap!`);
  if (args[1] instanceof Fn) {
    const newValue = args[1].apply([args[0].value, ...args.slice(2)]);
    args[0].value = newValue;
    return newValue;
  }
  if (typeof(args[1]) === "function") {
    const newValue = args[1]([args[0].value, ...args.slice(2)]);
    args[0].value = newValue;
    return newValue;
  }
  throw new Error(`Cannot swap non-atom value: ${args[0]}`);
});

core.set(new Symbol("read-string"), (args) => {
  if (args.length == 0) 
    throw new Error(`wrong number of args(${args.length}) to: read-string`);
  if (args[0] instanceof Str) {
    return read_str(args[0].string);
  }
  throw new Error(`Cannot read non-string value: ${args[0]}`);
});

core.set(new Symbol("slurp"), (args) => {
  if (args.length == 0) 
    throw new Error(`wrong number of args(${args.length}) to: slurp`);
  if (args[0] instanceof Str) {
    const content = fs.readFileSync(args[0].string, "utf8");
    return new Str(content);
  }
  throw new Error(`Filename must be string: ${args[0]}`);
});

core.set(new Symbol("cons"), (args) => {
  if (args.length !== 2) 
    throw new Error(`wrong number of args(${args.length}) to: slurp`);
  if (args[1] instanceof List || args[1] instanceof Vector) {
    return new List([args[0], ...args[1].ast]);
  }
  throw new Error(`Cannot prepend to non-list: ${args[1]}`);
});

core.set(new Symbol("concat"), (args) => {
  if (args.every(x => (x instanceof List || x instanceof Vector))) {
    const list = [];
    args.forEach(x => list.push(...x.ast));
    return new List(list);
  }
  throw new Error(`Cannot concat non-list item`);
});

module.exports = { core };
