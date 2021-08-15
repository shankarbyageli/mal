const readline = require('readline');
const reader = require("./reader");
const printer = require("./printer");
const { List, Symbol, Vector, HashMap } = require("./types");
const { Env } = require("./env");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const eval_ast = (ast, env) => {
  if (ast instanceof Symbol) {
    const value = env.get(ast);
    if (value === undefined) {
      throw new Error(`${ast} not found`);
    }
    return value;
  }
  if (ast instanceof List) {
    const evaluatedList = ast.ast.map(v => EVAL(v, env));
    return new List(evaluatedList);
  }
  if (ast instanceof Vector) {
    const evaluatedVector = ast.ast.map(v => EVAL(v, env));
    return new Vector(evaluatedVector);
  }
  if (ast instanceof HashMap) {
    const evaluatedList = [];
    for ([k, v] of ast.data.entries()) {
      evaluatedList.push(k);
      evaluatedList.push(EVAL(v, env));
    }
    return new HashMap(evaluatedList);
  }
  return ast;
};

const READ = (string) => reader.read_str(string);

const handle_def = (ast, env) => {
  if (!(ast.ast[1] instanceof Symbol)) {
    throw new Error("first argument to def must be a symbol");
  }
  if (ast.ast.length > 3) {
    throw new Error("too many arguments to def!");
  }
  if (ast.ast.length === 2) {
    return env.set(ast.ast[1], undefined);
  }
  return env.set(ast.ast[1], EVAL(ast.ast[2], env));
};

const handle_let = (ast, env) => {
  if (!(ast.ast[1] instanceof List || ast.ast[1] instanceof Vector)) {
    throw new Error("expected bindings for let*")
  }
  const inner_env = new Env(env);
  const bindings = ast.ast[1].ast;
  for (let i = 0; i < bindings.length; i += 2) {
    if (bindings[i] instanceof Symbol)
      inner_env.set(bindings[i], EVAL(bindings[i + 1], inner_env))
    else
      throw new Error("expected symbol but found: " + x);
  };
  return EVAL(ast.ast[2], inner_env);
}

const EVAL = (ast, env) => {
  if (!(ast instanceof List)) {
    return eval_ast(ast, env);
  }
  if (ast.isEmpty()) {
    return ast;
  }
  switch(ast.ast[0].name) {
    case "def!":
      return handle_def(ast, env);
    case "let*":
      return handle_let(ast, env);
    default:
      const evaluatedList = eval_ast(ast, env);
      return evaluatedList.ast[0].call(null, evaluatedList.ast.slice(1));
  }
};

const PRINT = (string) => printer.pr_str(string);

const env = new Env(null);
env.set(new Symbol("+"), (args) => args.reduce((r, x) => r + x, 0));
env.set(new Symbol("-"), (args) => {
  if (args.length === 0) {
    throw new Error(`wrong number of args(${args.length}) passed to : -`);
  }
  return args.reduce((r, x) => r - x);
});
env.set(new Symbol("*"), (args) => args.reduce((r, x) => r * x, 1));
env.set(new Symbol("/"), (args) => {
  if (args.length === 0) {
    throw new Error(`wrong number of args(${args.length}) passed to : /`);
  }
  return args.reduce((r, x) => r / x);
});

const repl = (string, env) => PRINT(EVAL(READ(string), env));

const loop = () => {
  rl.question("=> ", (string) => {
    try {
      console.log(repl(string, env));
    } catch(e) {
      console.log(e.message);
    } finally {
      loop();
    }
  });
};

loop();
