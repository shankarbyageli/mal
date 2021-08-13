const readline = require('readline');
const reader = require("./reader");
const printer = require("./printer");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const read = (string) => reader.read_str(string);
const eval = (string) => string;
const print = (string) => printer.pr_str(string);

const repl = (string) => print(eval(read(string)));

const loop = () => {
  rl.question("=> ", (string) => {
    try {
      console.log(repl(string));
    } catch {
      console.log("unbalanced");
    } finally {
      loop();
    }
  });
};

loop();
