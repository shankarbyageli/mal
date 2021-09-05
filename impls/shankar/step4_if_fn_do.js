const readline = require('readline');
const reader = require("./reader");
const printer = require("./printer");
const { List, Symbol, Vector, HashMap, Nil, Fn } = require("./types");
const { Env } = require("./env");
const { core } = require("./core");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const eval_ast = (ast, env) => {
  if (ast === undefined) {
    return new Nil();
  }
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

const handle_if = (ast, env) => {
  if (ast.ast.length > 4) {
    throw new Error("too many arguments to if");
  }
  if (ast.ast.length < 3) {
    throw new Error("too few arguments to if");
  }
  const result = EVAL(ast.ast[1], env);
  if (result instanceof Nil || result === false) {
    return EVAL(ast.ast[3], env);
  }
  return EVAL(ast.ast[2], env)
};

const handle_do = (ast, env) => {
  let result = new Nil();
  for (let i = 1; i < ast.ast.length; i++) {
    result = EVAL(ast.ast[i], env);
  }
  return result;
};

const handle_fn = (ast, env) => {
  if (ast.ast.length < 2) {
    throw new Error(`wrong number of args ${ast.ast.length} to: fn*`);
  }
  const fnArgSymbols = ast.ast[1].ast.map(x => x.name);
  const indexOfSpreadSymbol = fnArgSymbols.reduce((a, x, i) => { 
    if (x === "&") a.push(i);
    return a;
  }, []);
  if (indexOfSpreadSymbol.length !== 0) {
    if (indexOfSpreadSymbol.length > 1 || indexOfSpreadSymbol[0] !== fnArgSymbols.length - 2) {
      throw new Error(`invalid args list to: fn*`);
    }
  }
  const fn = function([...args]) {
    let evaluatedArgs = args.map(x => EVAL(x, env));
    if (indexOfSpreadSymbol.length === 1) {
      const oneToOneBinds = evaluatedArgs.slice(0, fnArgSymbols.length - 2);
      const spreadBinds = new List(evaluatedArgs.slice(fnArgSymbols.length - 2));
      evaluatedArgs = [...oneToOneBinds, spreadBinds];
      ast.ast[1].ast.splice(-2, 1);
    }
    const fn_env = new Env(env, ast.ast[1].ast, evaluatedArgs);
    let result = new Nil();
    for (let i = 2; i < ast.ast.length; i++) {
      result = EVAL(ast.ast[i], fn_env);
    }
    return result;
  };
  return new Fn(fn);
};

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
    case "if":
      return handle_if(ast, env);
    case "do":
      return handle_do(ast, env);
    case "fn*":
      return handle_fn(ast, env);
    default:
      const evaluatedList = eval_ast(ast, env);
      if (evaluatedList.ast[0] instanceof Fn) {
        return evaluatedList.ast[0].call(evaluatedList.ast.slice(1));
      }
      return evaluatedList;
  }
};

const PRINT = (string) => printer.pr_str(string);

const env = new Env(core);

const repl = (string, env) => {
  if (string.trim() === "") {
    return "";
  }
  return PRINT(EVAL(READ(string), env))
};

repl("(def! not (fn* (a) (if a false true)))", env);

const loop = () => {
  rl.question("=> ", (string) => {
    try {
      const result = repl(string, env);
      result && console.log(result);
    } catch(e) {
      console.log(e.message);
    } finally {
      loop();
    }
  });
};

loop();