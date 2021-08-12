const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const read = (string) => string;
const eval = (string) => string;
const print = (string) => string;

const repl = (string) => print(eval(read(string)));

const loop = () => {
  rl.question('=> ', (string) => {
    console.log(repl(string));
    loop();
  });
};

loop();
