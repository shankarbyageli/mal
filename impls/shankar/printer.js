const pr_str = (ast) => {
  if (Array.isArray(ast)) {
    return "(" + ast.map(pr_str).join(" ") + ")";
  }
  return ast.toString();
};

module.exports = { pr_str };
