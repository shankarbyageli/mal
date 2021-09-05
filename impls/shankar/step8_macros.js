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
    ast.ast[1].ast.splice(-2, 1);
  }
  const fn = function(args) {
    let evaluatedArgs = args.map(x => EVAL(x, env));
    if (indexOfSpreadSymbol.length === 1) {
      const oneToOneBinds = evaluatedArgs.slice(0, fnArgSymbols.length - 2);
      const spreadBinds = new List(evaluatedArgs.slice(fnArgSymbols.length - 2));
      evaluatedArgs = [...oneToOneBinds, spreadBinds];
    }
    const fn_env = new Env(env, ast.ast[1].ast, evaluatedArgs);
    let result = new Nil();
    for (let i = 2; i < ast.ast.length; i++) {
      result = EVAL(ast.ast[i], fn_env);
    }
    return result;
  };
  return new Fn(fn, indexOfSpreadSymbol.length === 1, ast.ast[2], env, ast.ast[1]);
};

const quasiquote = (ast) => {
  if(ast instanceof List) {
    if (ast.ast[0] instanceof Symbol && ast.ast[0].name === "unquote") {
      return ast.ast[1];
    }
    const reverseList = ast.ast.slice().reverse();
    let result = new List([]);
    reverseList.forEach(x => {
      if (x instanceof List && x.ast[0] instanceof Symbol && x.ast[0].name === "splice-unquote") {
        result = new List([new Symbol("concat"), x.ast[1], result]);
      } else {
        result = new List([new Symbol("cons"), quasiquote(x), result]);
      }
    });
    return result;
  }
  if (ast instanceof Symbol || ast instanceof HashMap) {
    return new List([new Symbol("quote"), ast]);
  }
  return ast;
};

const is_macro_call = (ast, env) => {
  return (
    ast instanceof List &&
    ast.ast[0] instanceof Symbol &&
    env.find(ast.ast[0]) &&
    env.get(ast.ast[0]).isMacro
  );
};

const macroexpand = (ast, env) => {
  while (is_macro_call(ast, env)) {
    const macro = env.get(ast.ast[0]);
    ast = macro.apply(ast.ast.slice(1));
  }
  return ast;
};

const EVAL = (ast, env) => {
  while(true) {
    ast = macroexpand(ast, env);
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
        ast = ast.ast[2]
        env = inner_env;
        continue;
      case "if":
        if (ast.ast.length > 4) {
          throw new Error("too many arguments to if");
        }
        if (ast.ast.length < 3) {
          throw new Error("too few arguments to if");
        }
        const ifResult = EVAL(ast.ast[1], env);
        if (ifResult instanceof Nil || ifResult === false) {
          ast = ast.ast[3];
        } else {
          ast = ast.ast[2];
        }
        continue;
      case "do":
        let result = new Nil();
        for (let i = 1; i < ast.ast.length - 1; i++) {
          result = EVAL(ast.ast[i], env);
        }
        ast = ast.ast[ast.ast.length - 1];
        continue;
      case "fn*":
        return handle_fn(ast, env);
      case "quote":
        return ast.ast[1];
      case "quasiquote":
        ast = quasiquote(ast.ast[1]);
        continue;
      case "quasiquoteexpand":
        return quasiquote(ast.ast[1]);
      case "unquote":
        ast = ast.ast[1];
        continue;
      case "defmacro!":
        const fn = EVAL(ast.ast[2], env);
        fn.isMacro = true;
        return env.set(ast.ast[1], fn);
      case "macroexpand":
        return macroexpand(ast.ast[1], env);
    }
    const evaluatedList = eval_ast(ast, env);
    const func = evaluatedList.ast[0];
    if (func instanceof Fn) {
      env = new Env(func.env, func.params.ast, evaluatedList.ast.slice(1));
      ast = func.ast;
    } else {
      if (typeof(func) === "function") {
        return func.call(null, evaluatedList.ast.slice(1));
      }
      return evaluatedList;
    }
  }
};

const PRINT = (string) => printer.pr_str(string);

const env = new Env(core);
env.set(new Symbol('eval'), (ast) => EVAL(ast[0], env));

const repl = (string, env) => {
  if (string.trim() === "") {
    return "";
  }
  return PRINT(EVAL(READ(string), env))
};

repl("(def! not (fn* (a) (if a false true)))", env);
repl('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))', env);
repl("(defmacro! cond (fn* (& xs) (if (> (count xs) 0) (list 'if (first xs) (if (> (count xs) 1) (nth xs 1) (throw \"odd number of forms to cond\")) (cons 'cond (rest (rest xs)))))))", env);
repl('(defmacro! if-not (fn* [test else-part if-part] `(if (not ~test) ~else-part ~if-part)))', env);

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
