const { Env } = require("./env");
const { Symbol, Fn, Nil, List, Vector, Str } = require("./types");
const { pr_str } = require("./printer");

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
  return '"' + strings.join("") + '"';
});

module.exports = { core };
