const Type = ["LogicalExpression", "ComparisonExpression"];
const Rules = ["AND", "OR", "NOT"];
const Operators = ["==","!=","<",">","<=",">=","contains","not_contains"];

const operatorsMapping = {
  "Greater than or equal to (≥)": ">=",
  "Less than or equal to (≤)": "<=",
  "Equal to (=)": "==",
  "Greater than (>)": ">",
  "Less than (<)": "<",
  "Contains": "contains",
  "Does not contain": "not_contains"
};

// Main Function for building AST
const buildAST = (DSL) => {
  let sizeOfDSL = DSL.size;
  if (sizeOfDSL === 0) return {};

  if (sizeOfDSL === 1) {
    const rule = DSL.values().next().value;
    return boilerCodeForComparisonExpression(rule.operator, rule.field, rule.value);
  }

  return recursiveASTBuilder(DSL);                  
};

// Recursive AST Builder
const recursiveASTBuilder = (DSL) => {
  let sizeOfDSL = DSL.size;
  if (sizeOfDSL === 0) return {};

  const rule1 = removeFirstEntry(DSL);
  const operator = removeFirstEntry(DSL);
  const rule2 = removeFirstEntry(DSL);

  if (DSL.size === 0) {
    return boilerCodeForLogicalExpression(operator, rule1, rule2);
  } else {
    return boilerCodeForLogicalExpression(operator, rule1, recursiveASTBuilder(DSL));
  }
};

// Helper: remove first entry
function removeFirstEntry(map) {
    const iterator = map.keys().next();
    if (!iterator.done) {
      const key = iterator.value;
      const value = map.get(key);
      map.delete(key);
      return value;
    }
  }

// AST node builders
const boilerCodeForLogicalExpression = (operator, ...children) => ({
  type: Type[0],
  operator: operatorsMapping[operator] || operator,
  children
});

const boilerCodeForComparisonExpression = (operator, field, value) => ({
  type: Type[1],
  field,
  operator: operatorsMapping[operator] || operator,
  value
});

module.exports = {
  buildAST
};