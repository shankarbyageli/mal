const readline = require('readline');
const reader = require("./reader");
const printer = require("./printer");
const { List, Symbol, Vector, HashMap } = require("./types");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const eval_ast = (ast, env) => {
  if (ast instanceof Symbol) {
    if (env[ast.name] === undefined) {
      throw new Error("symbol not defined: " + ast);
    }
    return env[ast.name];
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

const EVAL = (ast, env) => {
  if (!(ast instanceof List)) {
    return eval_ast(ast, env);
  }
  if (ast.isEmpty()) {
    return ast;
  }
  const evaluatedList = eval_ast(ast, env);
  return evaluatedList.ast[0].call(null, evaluatedList.ast.slice(1));
};

const PRINT = (string) => printer.pr_str(string);

const env = {
  "+": (args) => args.reduce((r, x) => r + x, 0),
  "-": (args) => {
    if (args.length === 0) {
      throw new Error(`wrong number of args(${args.length}) passed to : -`);
    }
    return args.reduce((r, x) => r - x);
  },
  "*": (args) => args.reduce((r, x) => r * x, 1),
  "/": (args) => {
    if (args.length === 0) {
      throw new Error(`wrong number of args(${args.length}) passed to : /`);
    }
    return args.reduce((r, x) => r / x);
  }
};

const repl = (string, env) => PRINT(EVAL(READ(string), env));

const loop = () => {
  rl.question("=> ", (string) => {
    try {
      console.log(repl(string, env));
    } catch(e) {
      console.log(e.stack);
    } finally {
      loop();
    }
  });
};

loop();
