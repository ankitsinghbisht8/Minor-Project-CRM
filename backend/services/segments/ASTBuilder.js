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

  // Extract global operator and rules
  const globalOperator = DSL.get('operator') || 'AND';
  
  // Get all rule entries (keys starting with 'rule-')
  const ruleEntries = [];
  for (const [key, value] of DSL.entries()) {
    if (key.startsWith('rule-') && typeof value === 'object' && value.field) {
      ruleEntries.push(value);
    }
  }

  // If no rules found, return empty
  if (ruleEntries.length === 0) {
    return {};
  }

  // If only one rule, return a simple comparison expression
  if (ruleEntries.length === 1) {
    const rule = ruleEntries[0];
    return boilerCodeForComparisonExpression(rule.operator, rule.field, rule.value);
  }

  // Multiple rules - build logical expression
  const children = ruleEntries.map(rule => 
    boilerCodeForComparisonExpression(rule.operator, rule.field, rule.value)
  );

  return boilerCodeForLogicalExpression(globalOperator, ...children);
};

// Helper: remove first entry (kept for backward compatibility)
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