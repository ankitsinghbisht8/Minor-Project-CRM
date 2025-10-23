const sequelize = require('../../config/database');

/**
 * Evaluates an AST (Abstract Syntax Tree) to build SQL WHERE clause
 * @param {Object} ast - The AST node to evaluate
 * @returns {String} - SQL WHERE clause
 */
const evaluateAST = (ast) => {
    if (!ast || !ast.type) {
        return '1=1'; // Default to true if no AST
    }

    if (ast.type === 'ComparisonExpression') {
        return evaluateComparisonExpression(ast);
    }

    if (ast.type === 'LogicalExpression') {
        return evaluateLogicalExpression(ast);
    }

    return '1=1';
};

/**
 * Evaluates a comparison expression (field operator value)
 * @param {Object} node - The comparison node
 * @returns {String} - SQL condition
 */
const evaluateComparisonExpression = (node) => {
    const { field, operator, value } = node;

    if (!field || !operator || value === undefined || value === null || value === '') {
        return '1=1';
    }

      // Map frontend field names to aggregated SQL column names
    // Frontend uses camelCase, SQL aggregation creates these column aliases
    const fieldMap = {
        // Aggregated fields (calculated in CTE)
        totalSpend: 'totalSpend',      // SUM of completed order amounts
        totalOrders: 'totalOrders',    // COUNT of completed orders
        visits: 'visits',              // SUM of Visit interactions
        lastPurchase: 'lastPurchase',  // MAX order_date of completed orders
        
        // Direct customer table fields
        registrationDate: 'registrationDate',  // customers.created_at
        age: 'age',                            // customers.age
        location: 'location',                  // customers.location
        email: 'email',                        // customers.email
        full_name: 'full_name',                // customers.full_name
        phone_number: 'phone_number',          // customers.phone_number
        gender: 'gender'                       // customers.gender
    };

    const mappedField = fieldMap[field] || field;

    switch (operator) {
        case '>=':
        case 'gte':
            return `${mappedField} >= ${sequelize.escape(value)}`;
        case '<=':
        case 'lte':
            return `${mappedField} <= ${sequelize.escape(value)}`;
        case '>':
        case 'gt':
            return `${mappedField} > ${sequelize.escape(value)}`;
        case '<':
        case 'lt':
            return `${mappedField} < ${sequelize.escape(value)}`;
        case '==':
        case '=':
        case 'eq':
            return `${mappedField} = ${sequelize.escape(value)}`;
        case '!=':
            return `${mappedField} != ${sequelize.escape(value)}`;
        case 'contains':
            return `${mappedField}::text ILIKE ${sequelize.escape('%' + value + '%')}`;
        case 'not_contains':
            return `${mappedField}::text NOT ILIKE ${sequelize.escape('%' + value + '%')}`;
        default:
            console.warn(`Unknown operator: ${operator}`);
            return '1=1';
    }
};

/**
 * Evaluates a logical expression (AND/OR/NOT)
 * @param {Object} node - The logical node
 * @returns {String} - SQL condition with logical operators
 */
const evaluateLogicalExpression = (node) => {
    const { operator, children } = node;

    if (!children || children.length === 0) {
        return '1=1';
    }

    const conditions = children.map(child => {
        const condition = evaluateAST(child);
        // Wrap in parentheses for proper precedence
        return `(${condition})`;
    });

    if (conditions.length === 1) {
        return conditions[0];
    }

    switch (operator?.toUpperCase()) {
        case 'AND':
            return conditions.join(' AND ');
        case 'OR':
            return conditions.join(' OR ');
        case 'NOT':
            return `NOT (${conditions[0]})`;
        default:
            console.warn(`Unknown logical operator: ${operator}`);
            return conditions.join(' AND '); // Default to AND
    }
};

/**
 * Calculates audience size and returns matching customers
 * @param {Object} ast - The AST to evaluate
 * @param {Object} options - Additional options
 * @param {Boolean} options.returnCustomers - Whether to return customer details
 * @param {Number} options.limit - Limit number of customers returned
 * @returns {Object} - { audienceSize, customers }
 */
const calculateAudience = async (ast, options = {}) => {
    try {
        const { returnCustomers = false, limit = null } = options;

        // Build WHERE clause from AST
        const whereClause = evaluateAST(ast);
        console.log('[AudienceEvaluator] WHERE clause:', whereClause);

        // Base query with customer aggregations
        // Maps to actual database schema from init-db.js
        const baseQuery = `
            WITH agg AS (
                SELECT
                    c.customer_id,
                    c.full_name,
                    c.email,
                    c.phone_number,
                    c.age,
                    c.gender,
                    c.location,
                    c.preferred_category,
                    c.mode_of_communication,
                    c.customer_segment,
                    c.subscribed,
                    c.created_at AS registrationDate,
                    c.last_visited,
                    c.last_contacted,
                    -- Aggregated metrics from orders
                    COALESCE(SUM(CASE WHEN o.order_status = 'Completed' THEN o.order_amount ELSE 0 END), 0) AS totalSpend,
                    COUNT(CASE WHEN o.order_status = 'Completed' THEN 1 END) AS totalOrders,
                    -- Aggregated metrics from interactions
                    COALESCE(SUM(CASE WHEN i.interaction_type = 'Visit' THEN 1 ELSE 0 END), 0) AS visits,
                    -- Latest completed order date
                    MAX(CASE WHEN o.order_status = 'Completed' THEN o.order_date END) AS lastPurchase
                FROM customers c
                LEFT JOIN orders o ON c.customer_id = o.customer_id
                LEFT JOIN interactions i ON c.customer_id = i.customer_id
                GROUP BY 
                    c.customer_id, 
                    c.full_name, 
                    c.email, 
                    c.phone_number, 
                    c.age, 
                    c.gender,
                    c.location,
                    c.preferred_category,
                    c.mode_of_communication,
                    c.customer_segment,
                    c.subscribed,
                    c.created_at,
                    c.last_visited,
                    c.last_contacted
            )
        `;

        // Count query
        const countQuery = `
            ${baseQuery}
            SELECT COUNT(*) as count
            FROM agg
            WHERE ${whereClause};
        `;

        console.log('[AudienceEvaluator] Count query:', countQuery);
        const [countResult] = await sequelize.query(countQuery);
        const audienceSize = parseInt(countResult[0]?.count || 0);

        let customers = [];
        if (returnCustomers && audienceSize > 0) {
            // Customers query with optional limit
            const customersQuery = `
                ${baseQuery}
                SELECT *
                FROM agg
                WHERE ${whereClause}
                ORDER BY totalSpend DESC, customer_id
                ${limit ? `LIMIT ${limit}` : ''};
            `;

            console.log('[AudienceEvaluator] Customers query:', customersQuery);
            const [customersResult] = await sequelize.query(customersQuery);
            customers = customersResult;
        }

        return {
            audienceSize,
            customers,
            whereClause // For debugging
        };
    } catch (error) {
        console.error('[AudienceEvaluator] Error:', error);
        throw error;
    }
};

/**
 * Validates if an AST is properly formed
 * @param {Object} ast - The AST to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
const validateAST = (ast) => {
    const errors = [];

    if (!ast) {
        errors.push('AST is null or undefined');
        return { valid: false, errors };
    }

    if (!ast.type) {
        errors.push('AST missing type field');
        return { valid: false, errors };
    }

    if (!['LogicalExpression', 'ComparisonExpression'].includes(ast.type)) {
        errors.push(`Invalid AST type: ${ast.type}`);
        return { valid: false, errors };
    }

    if (ast.type === 'ComparisonExpression') {
        if (!ast.field) errors.push('ComparisonExpression missing field');
        if (!ast.operator) errors.push('ComparisonExpression missing operator');
        if (ast.value === undefined || ast.value === null) {
            errors.push('ComparisonExpression missing value');
        }
    }

    if (ast.type === 'LogicalExpression') {
        if (!ast.operator) errors.push('LogicalExpression missing operator');
        if (!ast.children || !Array.isArray(ast.children)) {
            errors.push('LogicalExpression missing or invalid children');
        } else {
            // Recursively validate children
            ast.children.forEach((child, index) => {
                const childValidation = validateAST(child);
                if (!childValidation.valid) {
                    errors.push(`Child ${index}: ${childValidation.errors.join(', ')}`);
                }
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

module.exports = {
    evaluateAST,
    calculateAudience,
    validateAST,
    evaluateComparisonExpression,
    evaluateLogicalExpression
};

