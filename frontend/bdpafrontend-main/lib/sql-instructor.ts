// SQL Learning Hub AI Instructor
// Provides structured learning paths, exercises, and interactive guidance

export interface SQLLevel {
  level: number;
  title: string;
  description: string;
  learningGoals: string[];
  challenges: SQLChallenge[];
  schema?: string;
  prerequisites?: string[];
}

export interface SQLChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  schema?: string;
  sampleData?: Record<string, any[]>;
  question: string;
  expectedOutput?: string;
  hints: string[];
  solution?: string;
  evaluationCriteria?: string[];
  resources?: Array<{
    type: 'youtube' | 'article' | 'documentation';
    title: string;
    url: string;
    description: string;
  }>;
  industryContext?: string;
  businessValue?: string;
}

export interface SQLHint {
  level: number;
  hint: string;
  nextHint?: string;
}

export interface SQLExplanation {
  query: string;
  explanation: string;
  lineByLine: Array<{ line: string; explanation: string }>;
  concepts: string[];
}

// Level definitions
export const SQL_LEVELS: Record<number, SQLLevel> = {
  1: {
    level: 1,
    title: 'Foundations',
    description: 'Master the basics: SELECT, WHERE, ORDER BY, and filtering data',
    learningGoals: [
      'Understand SELECT statements and column selection',
      'Filter data using WHERE clauses',
      'Sort results with ORDER BY',
      'Use comparison and logical operators',
      'Work with NULL values'
    ],
    schema: `-- Sample E-commerce Database Schema
CREATE TABLE products (
  product_id INT PRIMARY KEY,
  name VARCHAR(100),
  category VARCHAR(50),
  price DECIMAL(10, 2),
  stock_quantity INT,
  created_at DATE
);

CREATE TABLE customers (
  customer_id INT PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(100),
  registration_date DATE
);

CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_id INT,
  order_date DATE,
  total_amount DECIMAL(10, 2),
  status VARCHAR(20)
);`,
    challenges: [
      {
        id: 'level1-challenge1',
        title: 'List All Products - E-commerce Inventory',
        description: 'As a data analyst at an e-commerce company, you need to retrieve the complete product catalog for inventory review. Write a query to retrieve all columns from the products table.',
        difficulty: 'beginner',
        industryContext: 'E-commerce companies regularly need to audit their product inventory. This is a fundamental task for inventory management, pricing analysis, and product catalog maintenance.',
        businessValue: 'This query enables product managers to review the entire catalog, identify missing information, and ensure all products are properly listed in the system.',
        schema: `CREATE TABLE products (
  product_id INT PRIMARY KEY,
  name VARCHAR(100),
  category VARCHAR(50),
  price DECIMAL(10, 2),
  stock_quantity INT,
  created_at DATE
);`,
        sampleData: {
          products: [
            { product_id: 1, name: 'Wireless Mouse', category: 'Electronics', price: 29.99, stock_quantity: 150, created_at: '2024-01-15' },
            { product_id: 2, name: 'Mechanical Keyboard', category: 'Electronics', price: 89.99, stock_quantity: 75, created_at: '2024-02-01' },
            { product_id: 3, name: 'USB-C Cable', category: 'Accessories', price: 12.99, stock_quantity: 300, created_at: '2024-01-20' },
            { product_id: 4, name: 'Laptop Stand', category: 'Accessories', price: 45.00, stock_quantity: 120, created_at: '2024-02-10' },
            { product_id: 5, name: 'Monitor 27"', category: 'Electronics', price: 299.99, stock_quantity: 50, created_at: '2024-01-05' }
          ]
        },
        question: 'Your manager asks you to generate a complete list of all products in the database for a quarterly inventory review. Write a SQL query to retrieve all product information.',
        expectedOutput: 'All 5 products with their complete details',
        hints: [
          'Start with the SELECT keyword',
          'Use * to select all columns',
          'Specify the table name with FROM'
        ],
        solution: 'SELECT * FROM products;',
        evaluationCriteria: ['Uses SELECT keyword', 'Uses FROM keyword', 'References products table'],
        resources: [
          {
            type: 'youtube',
            title: 'SQL Tutorial - Full Database Course for Beginners',
            url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
            description: 'Comprehensive SQL tutorial covering SELECT statements and database fundamentals'
          },
          {
            type: 'article',
            title: 'SQL Basics: SELECT Statement',
            url: 'https://www.w3schools.com/sql/sql_select.asp',
            description: 'Comprehensive guide to SELECT statements'
          }
        ]
      },
      {
        id: 'level1-challenge2',
        title: 'Identify Premium Products - Pricing Analysis',
        description: 'The marketing team wants to create a "Premium Products" campaign. They need all products priced above $50. Write a query to find these products.',
        difficulty: 'beginner',
        industryContext: 'E-commerce businesses frequently segment products by price for targeted marketing campaigns, inventory planning, and sales strategy. Premium products often have different marketing approaches and customer segments.',
        businessValue: 'This query helps identify high-value products for premium marketing campaigns, which typically have higher profit margins and require different sales strategies.',
        schema: `CREATE TABLE products (
  product_id INT PRIMARY KEY,
  name VARCHAR(100),
  category VARCHAR(50),
  price DECIMAL(10, 2),
  stock_quantity INT,
  created_at DATE
);`,
        sampleData: {
          products: [
            { product_id: 1, name: 'Wireless Mouse', category: 'Electronics', price: 29.99, stock_quantity: 150, created_at: '2024-01-15' },
            { product_id: 2, name: 'Mechanical Keyboard', category: 'Electronics', price: 89.99, stock_quantity: 75, created_at: '2024-02-01' },
            { product_id: 3, name: 'USB-C Cable', category: 'Accessories', price: 12.99, stock_quantity: 300, created_at: '2024-01-20' },
            { product_id: 4, name: 'Laptop Stand', category: 'Accessories', price: 45.00, stock_quantity: 120, created_at: '2024-02-10' },
            { product_id: 5, name: 'Monitor 27"', category: 'Electronics', price: 299.99, stock_quantity: 50, created_at: '2024-01-05' },
            { product_id: 6, name: 'Gaming Headset', category: 'Electronics', price: 79.99, stock_quantity: 90, created_at: '2024-02-15' }
          ]
        },
        question: 'The marketing team is planning a "Premium Products" campaign targeting high-value customers. Write a SQL query to find all products with a price greater than $50.',
        expectedOutput: 'Products with ID 2, 5, and 6 (Mechanical Keyboard, Monitor, Gaming Headset)',
        hints: [
          'Use WHERE clause to filter rows',
          'Price column is named "price"',
          'Use > operator for greater than comparisons',
          'The WHERE clause comes after FROM'
        ],
        solution: 'SELECT * FROM products WHERE price > 50;',
        evaluationCriteria: ['Uses WHERE clause', 'Correct comparison operator (>)', 'Correct column name (price)'],
        resources: [
          {
            type: 'youtube',
            title: 'SQL WHERE Clause - Filtering Data',
            url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
            description: 'Learn how to filter data using WHERE clause with comparison operators'
          },
          {
            type: 'article',
            title: 'SQL WHERE Clause',
            url: 'https://www.w3schools.com/sql/sql_where.asp',
            description: 'Complete guide to filtering data with WHERE clause'
          }
        ]
      },
      {
        id: 'level1-challenge3',
        title: 'Product Price Ranking - Sales Strategy',
        description: 'The sales team needs products sorted by price (highest first) to prioritize high-value sales. Write a query to display products in descending price order.',
        difficulty: 'beginner',
        industryContext: 'Sales teams often prioritize products by price to focus on high-value items first. This helps maximize revenue per transaction and guides sales strategy.',
        businessValue: 'Sorting products by price helps sales teams identify which products to prioritize, understand pricing tiers, and develop upselling strategies.',
        schema: `CREATE TABLE products (
  product_id INT PRIMARY KEY,
  name VARCHAR(100),
  category VARCHAR(50),
  price DECIMAL(10, 2),
  stock_quantity INT,
  created_at DATE
);`,
        sampleData: {
          products: [
            { product_id: 1, name: 'Wireless Mouse', category: 'Electronics', price: 29.99, stock_quantity: 150, created_at: '2024-01-15' },
            { product_id: 2, name: 'Mechanical Keyboard', category: 'Electronics', price: 89.99, stock_quantity: 75, created_at: '2024-02-01' },
            { product_id: 3, name: 'USB-C Cable', category: 'Accessories', price: 12.99, stock_quantity: 300, created_at: '2024-01-20' },
            { product_id: 4, name: 'Laptop Stand', category: 'Accessories', price: 45.00, stock_quantity: 120, created_at: '2024-02-10' },
            { product_id: 5, name: 'Monitor 27"', category: 'Electronics', price: 299.99, stock_quantity: 50, created_at: '2024-01-05' }
          ]
        },
        question: 'The sales team wants to see products ranked by price from highest to lowest to identify top-priority items. Write a SQL query to display all products sorted by price in descending order.',
        expectedOutput: 'Products ordered: Monitor ($299.99), Mechanical Keyboard ($89.99), Laptop Stand ($45.00), Wireless Mouse ($29.99), USB-C Cable ($12.99)',
        hints: [
          'Use ORDER BY clause to sort results',
          'DESC keyword sorts in descending order (highest first)',
          'ASC is default (ascending - lowest first)',
          'ORDER BY comes after WHERE (if used)'
        ],
        solution: 'SELECT * FROM products ORDER BY price DESC;',
        evaluationCriteria: ['Uses ORDER BY clause', 'Specifies DESC keyword', 'Correct column name (price)'],
        resources: [
          {
            type: 'youtube',
            title: 'SQL ORDER BY - Sorting Results',
            url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
            description: 'Learn how to sort query results using ORDER BY with ASC and DESC'
          },
          {
            type: 'article',
            title: 'SQL ORDER BY',
            url: 'https://www.w3schools.com/sql/sql_orderby.asp',
            description: 'Guide to sorting data with ORDER BY clause'
          }
        ]
      },
      {
        id: 'level1-challenge4',
        title: 'Targeted Product Search - Category & Price Range',
        description: 'The procurement team needs to review mid-range Electronics products ($100-$500) for a supplier negotiation. Write a query to find these products.',
        difficulty: 'beginner',
        industryContext: 'Businesses often need to filter products by multiple criteria simultaneously. This is common in procurement, inventory management, and pricing analysis. Combining category and price filters helps identify specific product segments.',
        businessValue: 'This query helps procurement teams identify products in specific categories within price ranges, enabling better supplier negotiations and inventory planning.',
        schema: `CREATE TABLE products (
  product_id INT PRIMARY KEY,
  name VARCHAR(100),
  category VARCHAR(50),
  price DECIMAL(10, 2),
  stock_quantity INT,
  created_at DATE
);`,
        sampleData: {
          products: [
            { product_id: 1, name: 'Wireless Mouse', category: 'Electronics', price: 29.99, stock_quantity: 150, created_at: '2024-01-15' },
            { product_id: 2, name: 'Mechanical Keyboard', category: 'Electronics', price: 89.99, stock_quantity: 75, created_at: '2024-02-01' },
            { product_id: 3, name: 'USB-C Cable', category: 'Accessories', price: 12.99, stock_quantity: 300, created_at: '2024-01-20' },
            { product_id: 4, name: 'Laptop Stand', category: 'Accessories', price: 45.00, stock_quantity: 120, created_at: '2024-02-10' },
            { product_id: 5, name: 'Monitor 27"', category: 'Electronics', price: 299.99, stock_quantity: 50, created_at: '2024-01-05' },
            { product_id: 6, name: 'Gaming Headset', category: 'Electronics', price: 79.99, stock_quantity: 90, created_at: '2024-02-15' },
            { product_id: 7, name: 'Webcam HD', category: 'Electronics', price: 129.99, stock_quantity: 60, created_at: '2024-01-25' }
          ]
        },
        question: 'The procurement team is preparing for supplier negotiations and needs to identify all Electronics products priced between $100 and $500. Write a SQL query to find these products.',
        expectedOutput: 'Products with ID 5 (Monitor) and ID 7 (Webcam HD)',
        hints: [
          'Use AND operator to combine multiple conditions',
          'Use BETWEEN for price range checks (inclusive)',
          'String values like "Electronics" need single quotes',
          'You can also use: price >= 100 AND price <= 500'
        ],
        solution: 'SELECT * FROM products WHERE category = \'Electronics\' AND price BETWEEN 100 AND 500;',
        evaluationCriteria: ['Uses AND operator', 'Uses BETWEEN or >= AND <=', 'Correct string comparison with quotes', 'Both conditions properly combined'],
        resources: [
          {
            type: 'youtube',
            title: 'SQL AND, OR, NOT Operators - Multiple Conditions',
            url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
            description: 'Learn how to combine multiple conditions in SQL WHERE clauses using logical operators'
          },
          {
            type: 'article',
            title: 'SQL AND, OR, NOT Operators',
            url: 'https://www.w3schools.com/sql/sql_and_or_not.asp',
            description: 'Complete guide to logical operators in SQL'
          }
        ]
      },
      {
        id: 'level1-challenge5',
        title: 'Data Quality Check - Identify Products with Stock Data',
        description: 'The inventory manager needs to identify products with complete stock quantity data. Some products may have NULL values due to data entry errors. Write a query to find products with valid stock data.',
        difficulty: 'beginner',
        industryContext: 'Data quality is critical in business operations. NULL values often indicate missing or incomplete data. Identifying records with NULL values helps maintain data integrity and ensures accurate inventory management.',
        businessValue: 'This query helps identify data quality issues, ensuring inventory reports are accurate. Products with NULL stock quantities can cause problems in inventory management systems and sales processes.',
        schema: `CREATE TABLE products (
  product_id INT PRIMARY KEY,
  name VARCHAR(100),
  category VARCHAR(50),
  price DECIMAL(10, 2),
  stock_quantity INT,
  created_at DATE
);`,
        sampleData: {
          products: [
            { product_id: 1, name: 'Wireless Mouse', category: 'Electronics', price: 29.99, stock_quantity: 150, created_at: '2024-01-15' },
            { product_id: 2, name: 'Mechanical Keyboard', category: 'Electronics', price: 89.99, stock_quantity: null, created_at: '2024-02-01' },
            { product_id: 3, name: 'USB-C Cable', category: 'Accessories', price: 12.99, stock_quantity: 300, created_at: '2024-01-20' },
            { product_id: 4, name: 'Laptop Stand', category: 'Accessories', price: 45.00, stock_quantity: null, created_at: '2024-02-10' },
            { product_id: 5, name: 'Monitor 27"', category: 'Electronics', price: 299.99, stock_quantity: 50, created_at: '2024-01-05' }
          ]
        },
        question: 'The inventory manager needs to generate a report of products with complete stock data. Some products have NULL values in stock_quantity due to data entry issues. Write a SQL query to find all products that have a stock_quantity value (not NULL).',
        expectedOutput: 'Products with ID 1, 3, and 5 (Wireless Mouse, USB-C Cable, Monitor)',
        hints: [
          'Use IS NOT NULL to check for non-null values',
          'IS NULL checks for null values',
          'NULL cannot be compared with = or !=, you must use IS NULL or IS NOT NULL',
          'The syntax is: column_name IS NOT NULL'
        ],
        solution: 'SELECT * FROM products WHERE stock_quantity IS NOT NULL;',
        evaluationCriteria: ['Uses IS NOT NULL', 'Correct syntax', 'Proper NULL handling (not using = or !=)'],
        resources: [
          {
            type: 'youtube',
            title: 'SQL NULL Values - Handling Missing Data',
            url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
            description: 'Learn how to handle NULL values in SQL queries using IS NULL and IS NOT NULL'
          },
          {
            type: 'article',
            title: 'SQL NULL Values',
            url: 'https://www.w3schools.com/sql/sql_null_values.asp',
            description: 'Complete guide to working with NULL values in SQL'
          }
        ]
      }
    ]
  },
  2: {
    level: 2,
    title: 'Intermediate',
    description: 'Learn JOINs, GROUP BY, HAVING, and aggregate functions',
    learningGoals: [
      'Master INNER, LEFT, RIGHT, and FULL JOINs',
      'Use aggregate functions (COUNT, SUM, AVG, MAX, MIN)',
      'Group data with GROUP BY',
      'Filter groups with HAVING',
      'Combine multiple tables effectively'
    ],
    schema: `-- Extended Schema with Relationships
CREATE TABLE products (
  product_id INT PRIMARY KEY,
  name VARCHAR(100),
  category_id INT,
  price DECIMAL(10, 2)
);

CREATE TABLE categories (
  category_id INT PRIMARY KEY,
  category_name VARCHAR(50)
);

CREATE TABLE order_items (
  order_item_id INT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT,
  unit_price DECIMAL(10, 2)
);

CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_id INT,
  order_date DATE,
  total_amount DECIMAL(10, 2)
);`,
    challenges: [
      {
        id: 'level2-challenge1',
        title: 'Product-Category Analysis - JOIN Operations',
        description: 'As a business analyst, you need to create a report showing products with their category names. The data is split across two tables that need to be joined. Write a query to combine this information.',
        difficulty: 'intermediate',
        industryContext: 'In real-world databases, data is normalized across multiple tables to avoid redundancy. JOINs are essential for combining related data from different tables. This is one of the most common operations in business analytics.',
        businessValue: 'JOINs enable comprehensive reporting by combining product details with category information, allowing for better product categorization, inventory management, and sales analysis across product lines.',
        schema: `CREATE TABLE products (
  product_id INT PRIMARY KEY,
  name VARCHAR(100),
  category_id INT,
  price DECIMAL(10, 2)
);

CREATE TABLE categories (
  category_id INT PRIMARY KEY,
  category_name VARCHAR(50),
  description VARCHAR(200)
);`,
        sampleData: {
          products: [
            { product_id: 1, name: 'Wireless Mouse', category_id: 1, price: 29.99 },
            { product_id: 2, name: 'Mechanical Keyboard', category_id: 1, price: 89.99 },
            { product_id: 3, name: 'USB-C Cable', category_id: 2, price: 12.99 },
            { product_id: 4, name: 'Laptop Stand', category_id: 2, price: 45.00 },
            { product_id: 5, name: 'Monitor 27"', category_id: 1, price: 299.99 }
          ],
          categories: [
            { category_id: 1, category_name: 'Electronics', description: 'Electronic devices and components' },
            { category_id: 2, category_name: 'Accessories', description: 'Computer and device accessories' },
            { category_id: 3, category_name: 'Software', description: 'Software products and licenses' }
          ]
        },
        question: 'The business analyst needs a report showing product names alongside their category names. Write a SQL query using JOIN to display product name and category name from the related tables.',
        expectedOutput: '5 rows showing each product with its category name (Electronics or Accessories)',
        hints: [
          'Use INNER JOIN or just JOIN to combine tables',
          'Specify the join condition with ON keyword',
          'Match foreign key (category_id in products) to primary key (category_id in categories)',
          'Use table aliases (p for products, c for categories) for cleaner code'
        ],
        solution: 'SELECT p.name, c.category_name FROM products p INNER JOIN categories c ON p.category_id = c.category_id;',
        evaluationCriteria: ['Uses JOIN syntax', 'Correct join condition (ON clause)', 'Uses table aliases', 'Selects appropriate columns'],
        resources: [
          {
            type: 'youtube',
            title: 'SQL JOINs Explained | INNER, LEFT, RIGHT, FULL JOIN',
            url: 'https://www.youtube.com/watch?v=2HVMiPPuPIM',
            description: 'Comprehensive tutorial on SQL JOINs with real-world examples and industry use cases'
          },
          {
            type: 'article',
            title: 'SQL JOIN',
            url: 'https://www.w3schools.com/sql/sql_join.asp',
            description: 'Complete guide to SQL JOIN operations'
          }
        ]
      },
      {
        id: 'level2-challenge2',
        title: 'Order Volume Analysis - COUNT Aggregation',
        description: 'The operations team needs to know the total number of orders processed this month for capacity planning. Write a query to count all orders.',
        difficulty: 'intermediate',
        industryContext: 'COUNT is one of the most fundamental aggregate functions in SQL. It\'s used extensively in business reporting for metrics like order volumes, customer counts, transaction counts, and inventory tracking.',
        businessValue: 'Order counts are critical KPIs for operations teams to understand business volume, plan resources, and measure growth. This metric is used in executive dashboards and operational reports.',
        schema: `CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_id INT,
  order_date DATE,
  total_amount DECIMAL(10, 2),
  status VARCHAR(20)
);`,
        sampleData: {
          orders: [
            { order_id: 1001, customer_id: 101, order_date: '2024-11-01', total_amount: 129.98, status: 'completed' },
            { order_id: 1002, customer_id: 102, order_date: '2024-11-02', total_amount: 89.99, status: 'completed' },
            { order_id: 1003, customer_id: 103, order_date: '2024-11-03', total_amount: 299.99, status: 'completed' },
            { order_id: 1004, customer_id: 101, order_date: '2024-11-04', total_amount: 45.00, status: 'pending' },
            { order_id: 1005, customer_id: 104, order_date: '2024-11-05', total_amount: 179.98, status: 'completed' }
          ]
        },
        question: 'The operations manager needs to report the total number of orders in the system for this month\'s performance review. Write a SQL query to count all orders in the orders table.',
        expectedOutput: '5 (total number of orders)',
        hints: [
          'Use COUNT(*) to count all rows in the table',
          'COUNT(column) counts only non-NULL values in that column',
          'Use AS to give the result a meaningful name',
          'Aggregate functions like COUNT don\'t require GROUP BY when counting all rows'
        ],
        solution: 'SELECT COUNT(*) AS total_orders FROM orders;',
        evaluationCriteria: ['Uses COUNT(*) function', 'Uses alias (AS) for result', 'Correct syntax'],
        resources: [
          {
            type: 'youtube',
            title: 'SQL Aggregate Functions: COUNT, SUM, AVG, MAX, MIN',
            url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
            description: 'Learn aggregate functions including COUNT with practical business examples'
          },
          {
            type: 'article',
            title: 'SQL COUNT() Function',
            url: 'https://www.w3schools.com/sql/sql_count.asp',
            description: 'Complete guide to COUNT function in SQL'
          }
        ]
      },
      {
        id: 'level2-challenge3',
        title: 'Customer Lifetime Value - GROUP BY & SUM',
        description: 'The marketing team needs customer lifetime value (CLV) data to identify high-value customers. Calculate total spending per customer.',
        difficulty: 'intermediate',
        industryContext: 'Customer Lifetime Value (CLV) is a critical metric in e-commerce and SaaS businesses. It helps identify valuable customers, guide marketing spend, and inform retention strategies. GROUP BY with SUM is the standard way to calculate this.',
        businessValue: 'Understanding customer spending patterns enables targeted marketing, personalized offers, and helps prioritize customer service efforts. High CLV customers often receive VIP treatment.',
        schema: `CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_id INT,
  order_date DATE,
  total_amount DECIMAL(10, 2),
  status VARCHAR(20)
);`,
        sampleData: {
          orders: [
            { order_id: 1001, customer_id: 101, order_date: '2024-11-01', total_amount: 129.98, status: 'completed' },
            { order_id: 1002, customer_id: 102, order_date: '2024-11-02', total_amount: 89.99, status: 'completed' },
            { order_id: 1003, customer_id: 103, order_date: '2024-11-03', total_amount: 299.99, status: 'completed' },
            { order_id: 1004, customer_id: 101, order_date: '2024-11-04', total_amount: 45.00, status: 'completed' },
            { order_id: 1005, customer_id: 104, order_date: '2024-11-05', total_amount: 179.98, status: 'completed' },
            { order_id: 1006, customer_id: 101, order_date: '2024-11-06', total_amount: 89.99, status: 'completed' }
          ]
        },
        question: 'The marketing team is analyzing customer lifetime value and needs to see how much each customer has spent in total. Write a SQL query to calculate the total order amount for each customer.',
        expectedOutput: 'Customer 101: $264.97, Customer 102: $89.99, Customer 103: $299.99, Customer 104: $179.98',
        hints: [
          'Use SUM() aggregate function to calculate totals',
          'GROUP BY groups rows by customer_id',
          'Include customer_id in both SELECT and GROUP BY',
          'Only include completed orders if needed (use WHERE status = \'completed\')'
        ],
        solution: 'SELECT customer_id, SUM(total_amount) AS total_spent FROM orders WHERE status = \'completed\' GROUP BY customer_id;',
        evaluationCriteria: ['Uses GROUP BY clause', 'Uses SUM() aggregate function', 'Correct grouping column (customer_id)', 'Uses alias for result'],
        resources: [
          {
            type: 'youtube',
            title: 'SQL GROUP BY and Aggregate Functions',
            url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
            description: 'Learn how to group data and use aggregate functions like SUM for business analytics'
          },
          {
            type: 'article',
            title: 'SQL GROUP BY',
            url: 'https://www.w3schools.com/sql/sql_groupby.asp',
            description: 'Complete guide to GROUP BY clause with examples'
          }
        ]
      },
      {
        id: 'level2-challenge4',
        title: 'VIP Customer Identification - HAVING Clause',
        description: 'The customer success team wants to identify VIP customers (spent >$1000) for special treatment. Use HAVING to filter grouped results.',
        difficulty: 'intermediate',
        industryContext: 'HAVING is essential for filtering aggregated data. While WHERE filters individual rows, HAVING filters groups created by GROUP BY. This is crucial for identifying customers, products, or categories that meet aggregate criteria.',
        businessValue: 'Identifying high-value customers enables personalized service, loyalty programs, and targeted retention efforts. VIP customers often drive a significant portion of revenue.',
        schema: `CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_id INT,
  order_date DATE,
  total_amount DECIMAL(10, 2),
  status VARCHAR(20)
);`,
        sampleData: {
          orders: [
            { order_id: 1001, customer_id: 101, order_date: '2024-11-01', total_amount: 450.00, status: 'completed' },
            { order_id: 1002, customer_id: 102, order_date: '2024-11-02', total_amount: 89.99, status: 'completed' },
            { order_id: 1003, customer_id: 103, order_date: '2024-11-03', total_amount: 750.00, status: 'completed' },
            { order_id: 1004, customer_id: 101, order_date: '2024-11-04', total_amount: 600.00, status: 'completed' },
            { order_id: 1005, customer_id: 104, order_date: '2024-11-05', total_amount: 179.98, status: 'completed' },
            { order_id: 1006, customer_id: 101, order_date: '2024-11-06', total_amount: 89.99, status: 'completed' }
          ]
        },
        question: 'The customer success team needs to identify VIP customers who have spent more than $1000 total. Write a SQL query to show customers with total spending greater than 1000, along with their total amount.',
        expectedOutput: 'Customer 101: $1140.00 (only customer above $1000)',
        hints: [
          'Use HAVING to filter groups (not WHERE)',
          'HAVING comes after GROUP BY',
          'WHERE filters individual rows, HAVING filters aggregated groups',
          'Use the aggregate function (SUM) in the HAVING condition'
        ],
        solution: 'SELECT customer_id, SUM(total_amount) AS total_spent FROM orders WHERE status = \'completed\' GROUP BY customer_id HAVING SUM(total_amount) > 1000;',
        evaluationCriteria: ['Uses HAVING clause', 'Uses aggregate function (SUM) in HAVING', 'Proper GROUP BY usage', 'Correct comparison operator'],
        resources: [
          {
            type: 'youtube',
            title: 'SQL HAVING Clause Explained',
            url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
            description: 'Learn the difference between WHERE and HAVING with practical business examples'
          },
          {
            type: 'article',
            title: 'SQL HAVING Clause',
            url: 'https://www.w3schools.com/sql/sql_having.asp',
            description: 'Complete guide to HAVING clause and when to use it'
          }
        ]
      },
      {
        id: 'level2-challenge5',
        title: 'Order Detail Report - Multiple Table JOINs',
        description: 'The sales team needs a comprehensive order detail report showing order items with product and category information. Chain multiple JOINs to combine data from three tables.',
        difficulty: 'intermediate',
        industryContext: 'Real-world business queries often require joining multiple tables. This is common in e-commerce, ERP systems, and analytics platforms. Mastering multi-table JOINs is essential for creating comprehensive business reports.',
        businessValue: 'This type of query enables detailed order analysis, helps identify product category performance, and supports inventory management by showing what products are being ordered in which categories.',
        schema: `CREATE TABLE order_items (
  order_item_id INT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT,
  unit_price DECIMAL(10, 2)
);

CREATE TABLE products (
  product_id INT PRIMARY KEY,
  name VARCHAR(100),
  category_id INT,
  price DECIMAL(10, 2)
);

CREATE TABLE categories (
  category_id INT PRIMARY KEY,
  category_name VARCHAR(50)
);`,
        sampleData: {
          order_items: [
            { order_item_id: 1, order_id: 1001, product_id: 1, quantity: 2, unit_price: 29.99 },
            { order_item_id: 2, order_id: 1001, product_id: 3, quantity: 1, unit_price: 12.99 },
            { order_item_id: 3, order_id: 1002, product_id: 2, quantity: 1, unit_price: 89.99 },
            { order_item_id: 4, order_id: 1003, product_id: 5, quantity: 1, unit_price: 299.99 }
          ],
          products: [
            { product_id: 1, name: 'Wireless Mouse', category_id: 1, price: 29.99 },
            { product_id: 2, name: 'Mechanical Keyboard', category_id: 1, price: 89.99 },
            { product_id: 3, name: 'USB-C Cable', category_id: 2, price: 12.99 },
            { product_id: 5, name: 'Monitor 27"', category_id: 1, price: 299.99 }
          ],
          categories: [
            { category_id: 1, category_name: 'Electronics' },
            { category_id: 2, category_name: 'Accessories' }
          ]
        },
        question: 'The sales team needs a detailed order report showing order_id, product name, category name, and quantity for all order items. Write a SQL query that joins order_items with products, and then products with categories.',
        expectedOutput: '4 rows showing order items with product names and category names',
        hints: [
          'Start with order_items as the base table',
          'Join order_items with products using product_id',
          'Then join products with categories using category_id',
          'Chain JOINs: FROM order_items JOIN products ... JOIN categories ...',
          'Use table aliases (oi, p, c) for readability'
        ],
        solution: `SELECT oi.order_id, p.name AS product_name, c.category_name, oi.quantity
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN categories c ON p.category_id = c.category_id;`,
        evaluationCriteria: ['Uses multiple JOINs', 'Correct join conditions (product_id, category_id)', 'Proper table aliases', 'Selects appropriate columns'],
        resources: [
          {
            type: 'youtube',
            title: 'SQL Multiple Table JOINs Tutorial',
            url: 'https://www.youtube.com/watch?v=2HVMiPPuPIM',
            description: 'Learn how to join multiple tables in a single query for comprehensive business reports'
          },
          {
            type: 'article',
            title: 'SQL Joining Multiple Tables',
            url: 'https://www.w3schools.com/sql/sql_join.asp',
            description: 'Guide to joining multiple tables with examples'
          }
        ]
      }
    ]
  },
  3: {
    level: 3,
    title: 'Advanced',
    description: 'Master CTEs, Window Functions, and complex queries',
    learningGoals: [
      'Use Common Table Expressions (CTEs)',
      'Apply Window Functions (ROW_NUMBER, RANK, DENSE_RANK)',
      'Write subqueries and correlated subqueries',
      'Use CASE statements for conditional logic',
      'Optimize complex queries'
    ],
    schema: `-- Advanced Schema
CREATE TABLE employees (
  employee_id INT PRIMARY KEY,
  name VARCHAR(100),
  department VARCHAR(50),
  salary DECIMAL(10, 2),
  hire_date DATE
);

CREATE TABLE sales (
  sale_id INT PRIMARY KEY,
  employee_id INT,
  sale_date DATE,
  amount DECIMAL(10, 2),
  product_category VARCHAR(50)
);`,
    challenges: [
      {
        id: 'level3-challenge1',
        title: 'Compensation Analysis - Common Table Expressions (CTEs)',
        description: 'HR needs to identify employees earning above the company average for compensation review. Use a CTE to calculate the average salary and find high earners.',
        difficulty: 'advanced',
        industryContext: 'CTEs (Common Table Expressions) are essential for complex business analytics. They make queries more readable and allow you to break down complex logic into manageable parts. CTEs are widely used in financial analysis, HR reporting, and data science workflows.',
        businessValue: 'This query helps HR departments identify compensation outliers, plan salary adjustments, and ensure fair pay practices. CTEs make such analyses maintainable and easy to modify.',
        schema: `CREATE TABLE employees (
  employee_id INT PRIMARY KEY,
  name VARCHAR(100),
  department VARCHAR(50),
  salary DECIMAL(10, 2),
  hire_date DATE
);`,
        sampleData: {
          employees: [
            { employee_id: 1, name: 'John Smith', department: 'Engineering', salary: 120000, hire_date: '2020-01-15' },
            { employee_id: 2, name: 'Sarah Johnson', department: 'Sales', salary: 75000, hire_date: '2021-03-20' },
            { employee_id: 3, name: 'Mike Davis', department: 'Engineering', salary: 110000, hire_date: '2019-06-10' },
            { employee_id: 4, name: 'Emily Brown', department: 'Marketing', salary: 65000, hire_date: '2022-01-05' },
            { employee_id: 5, name: 'David Wilson', department: 'Engineering', salary: 130000, hire_date: '2018-11-30' }
          ]
        },
        question: 'The HR department needs to identify employees earning above the company average salary for a compensation review. Create a CTE to calculate the average salary, then find all employees earning more than this average.',
        expectedOutput: 'Employees with ID 1, 3, and 5 (John, Mike, David) - all above average',
        hints: [
          'CTE syntax: WITH cte_name AS (query)',
          'Calculate AVG(salary) in the CTE',
          'Reference the CTE in the main query',
          'Compare employee salary with CTE result in WHERE clause'
        ],
        solution: `WITH avg_salary AS (
  SELECT AVG(salary) AS avg_sal FROM employees
)
SELECT e.* FROM employees e, avg_salary a
WHERE e.salary > a.avg_sal;`,
        evaluationCriteria: ['Uses WITH keyword', 'Defines CTE correctly', 'References CTE in main query', 'Correct comparison logic'],
        resources: [
          {
            type: 'youtube',
            title: 'SQL CTEs (Common Table Expressions) Tutorial',
            url: 'https://www.youtube.com/watch?v=QNfnuK-1YY8',
            description: 'Learn how to use CTEs for complex queries and better code organization'
          },
          {
            type: 'article',
            title: 'SQL WITH / CTE',
            url: 'https://www.w3schools.com/sql/sql_cte.asp',
            description: 'Complete guide to Common Table Expressions in SQL'
          }
        ]
      },
      {
        id: 'level3-challenge2',
        title: 'Window Function - ROW_NUMBER',
        description: 'Rank employees by salary within each department',
        difficulty: 'advanced',
        question: 'Assign row numbers to employees partitioned by department, ordered by salary DESC',
        hints: [
          'Use ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)',
          'PARTITION BY groups the window',
          'ORDER BY determines ranking order'
        ],
        solution: 'SELECT employee_id, name, department, salary, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS salary_rank FROM employees;',
        evaluationCriteria: ['Uses ROW_NUMBER()', 'Uses PARTITION BY', 'Uses ORDER BY in OVER clause']
      },
      {
        id: 'level3-challenge3',
        title: 'Correlated Subquery',
        description: 'Find employees who earn more than their department average',
        difficulty: 'advanced',
        question: 'Use a correlated subquery to compare each employee salary with their department average',
        hints: [
          'Subquery references outer query',
          'Use alias to reference outer table',
          'Compare salary in WHERE clause'
        ],
        solution: `SELECT e1.* FROM employees e1
WHERE e1.salary > (
  SELECT AVG(e2.salary) FROM employees e2
  WHERE e2.department = e1.department
);`,
        evaluationCriteria: ['Uses subquery', 'Subquery references outer query', 'Correct correlation']
      },
      {
        id: 'level3-challenge4',
        title: 'CASE Statement',
        description: 'Categorize employees by salary ranges',
        difficulty: 'advanced',
        question: 'Create salary categories: High (>100k), Medium (50k-100k), Low (<50k)',
        hints: [
          'Use CASE WHEN ... THEN ... ELSE ... END',
          'Multiple WHEN clauses for ranges',
          'ELSE handles remaining cases'
        ],
        solution: `SELECT employee_id, name, salary,
CASE
  WHEN salary > 100000 THEN 'High'
  WHEN salary >= 50000 THEN 'Medium'
  ELSE 'Low'
END AS salary_category
FROM employees;`,
        evaluationCriteria: ['Uses CASE statement', 'Multiple conditions', 'Proper ELSE clause']
      },
      {
        id: 'level3-challenge5',
        title: 'Window Function - Running Total',
        description: 'Calculate running total of sales by date',
        difficulty: 'advanced',
        question: 'Show sales with a running total ordered by sale_date',
        hints: [
          'Use SUM() as window function',
          'Use ORDER BY in OVER clause',
          'No PARTITION BY means all rows in window'
        ],
        solution: `SELECT sale_id, sale_date, amount,
SUM(amount) OVER (ORDER BY sale_date) AS running_total
FROM sales
ORDER BY sale_date;`,
        evaluationCriteria: ['Uses SUM() as window function', 'Uses ORDER BY in OVER', 'Correct calculation']
      }
    ]
  },
  4: {
    level: 4,
    title: 'Real-world Scenarios',
    description: 'Build dashboards, handle transactions, and solve business problems',
    learningGoals: [
      'Create analytical dashboards with SQL',
      'Handle transactions and data integrity',
      'Solve complex business problems',
      'Optimize queries for performance',
      'Work with date/time functions'
    ],
    schema: `-- Business Analytics Schema
CREATE TABLE transactions (
  transaction_id INT PRIMARY KEY,
  customer_id INT,
  transaction_date TIMESTAMP,
  amount DECIMAL(10, 2),
  transaction_type VARCHAR(20),
  status VARCHAR(20)
);

CREATE TABLE customers (
  customer_id INT PRIMARY KEY,
  name VARCHAR(100),
  registration_date DATE,
  country VARCHAR(50)
);`,
    challenges: [
      {
        id: 'level4-challenge1',
        title: 'Monthly Revenue Dashboard',
        description: 'Calculate monthly revenue trends',
        difficulty: 'advanced',
        question: 'Show total revenue by month for the last 12 months, including month name',
        hints: [
          'Use DATE functions to extract month/year',
          'GROUP BY month',
          'Filter by date range'
        ],
        solution: `SELECT 
  TO_CHAR(transaction_date, 'YYYY-MM') AS month,
  SUM(amount) AS monthly_revenue
FROM transactions
WHERE transaction_date >= CURRENT_DATE - INTERVAL '12 months'
  AND status = 'completed'
GROUP BY TO_CHAR(transaction_date, 'YYYY-MM')
ORDER BY month;`,
        evaluationCriteria: ['Uses date functions', 'Groups by month', 'Filters by date range']
      },
      {
        id: 'level4-challenge2',
        title: 'Customer Lifetime Value',
        description: 'Calculate CLV for each customer',
        difficulty: 'advanced',
        question: 'Calculate total amount spent, number of transactions, and average transaction value per customer',
        hints: [
          'Use multiple aggregates',
          'GROUP BY customer',
          'Calculate derived metrics'
        ],
        solution: `SELECT 
  customer_id,
  COUNT(*) AS transaction_count,
  SUM(amount) AS total_spent,
  AVG(amount) AS avg_transaction_value
FROM transactions
WHERE status = 'completed'
GROUP BY customer_id;`,
        evaluationCriteria: ['Multiple aggregates', 'Correct grouping', 'Proper filtering']
      },
      {
        id: 'level4-challenge3',
        title: 'Top Performers',
        description: 'Find top 10 customers by revenue',
        difficulty: 'advanced',
        question: 'Identify the top 10 customers by total spending',
        hints: [
          'Calculate total per customer',
          'Use ORDER BY DESC',
          'Limit results with LIMIT or TOP'
        ],
        solution: `SELECT 
  customer_id,
  SUM(amount) AS total_spent
FROM transactions
WHERE status = 'completed'
GROUP BY customer_id
ORDER BY total_spent DESC
LIMIT 10;`,
        evaluationCriteria: ['Aggregation', 'Correct ordering', 'Uses LIMIT']
      },
      {
        id: 'level4-challenge4',
        title: 'Cohort Analysis',
        description: 'Analyze customer retention by registration month',
        difficulty: 'advanced',
        question: 'Show number of customers registered each month and their first transaction month',
        hints: [
          'Join customers with transactions',
          'Find minimum transaction date per customer',
          'Group by registration and first transaction months'
        ],
        solution: `WITH first_transactions AS (
  SELECT 
    customer_id,
    MIN(transaction_date) AS first_transaction_date
  FROM transactions
  GROUP BY customer_id
)
SELECT 
  TO_CHAR(c.registration_date, 'YYYY-MM') AS registration_month,
  TO_CHAR(ft.first_transaction_date, 'YYYY-MM') AS first_transaction_month,
  COUNT(DISTINCT c.customer_id) AS customer_count
FROM customers c
JOIN first_transactions ft ON c.customer_id = ft.customer_id
GROUP BY TO_CHAR(c.registration_date, 'YYYY-MM'), TO_CHAR(ft.first_transaction_date, 'YYYY-MM');`,
        evaluationCriteria: ['Uses CTE', 'Finds first transaction', 'Groups by months']
      },
      {
        id: 'level4-challenge5',
        title: 'Transaction Rollup',
        description: 'Create summary with multiple aggregation levels',
        difficulty: 'advanced',
        question: 'Create a report showing daily, monthly, and yearly totals using ROLLUP',
        hints: [
          'Use GROUP BY ROLLUP',
          'ROLLUP creates subtotals',
          'NULL indicates rollup level'
        ],
        solution: `SELECT 
  EXTRACT(YEAR FROM transaction_date) AS year,
  EXTRACT(MONTH FROM transaction_date) AS month,
  EXTRACT(DAY FROM transaction_date) AS day,
  SUM(amount) AS total
FROM transactions
WHERE status = 'completed'
GROUP BY ROLLUP (
  EXTRACT(YEAR FROM transaction_date),
  EXTRACT(MONTH FROM transaction_date),
  EXTRACT(DAY FROM transaction_date)
);`,
        evaluationCriteria: ['Uses ROLLUP', 'Multiple date extractions', 'Correct grouping']
      }
    ]
  },
  5: {
    level: 5,
    title: 'Capstone Project',
    description: 'End-to-end analytics system - build a complete data solution',
    learningGoals: [
      'Design and implement a complete analytics system',
      'Create complex multi-table queries',
      'Build performance-optimized queries',
      'Implement data quality checks',
      'Create comprehensive reporting queries'
    ],
    schema: `-- Complete E-commerce Analytics System
CREATE TABLE customers (
  customer_id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  registration_date DATE,
  country VARCHAR(50),
  customer_segment VARCHAR(50)
);

CREATE TABLE products (
  product_id INT PRIMARY KEY,
  name VARCHAR(100),
  category VARCHAR(50),
  price DECIMAL(10, 2),
  cost DECIMAL(10, 2),
  supplier_id INT
);

CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_id INT,
  order_date TIMESTAMP,
  status VARCHAR(20),
  shipping_country VARCHAR(50)
);

CREATE TABLE order_items (
  order_item_id INT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT,
  unit_price DECIMAL(10, 2)
);

CREATE TABLE suppliers (
  supplier_id INT PRIMARY KEY,
  name VARCHAR(100),
  country VARCHAR(50)
);`,
    challenges: [
      {
        id: 'level5-challenge1',
        title: 'Complete Sales Report',
        description: 'Build a comprehensive sales report with multiple metrics',
        difficulty: 'advanced',
        question: 'Create a report showing: customer name, order count, total revenue, average order value, and profit margin per customer',
        hints: [
          'Join multiple tables',
          'Calculate multiple aggregates',
          'Use derived calculations for profit'
        ],
        solution: `SELECT 
  c.name AS customer_name,
  COUNT(DISTINCT o.order_id) AS order_count,
  SUM(oi.quantity * oi.unit_price) AS total_revenue,
  AVG(oi.quantity * oi.unit_price) AS avg_order_value,
  SUM(oi.quantity * (oi.unit_price - p.cost)) AS total_profit,
  (SUM(oi.quantity * (oi.unit_price - p.cost)) / SUM(oi.quantity * oi.unit_price) * 100) AS profit_margin_pct
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
WHERE o.status = 'completed'
GROUP BY c.customer_id, c.name;`,
        evaluationCriteria: ['Multiple joins', 'Multiple aggregates', 'Calculated fields', 'Proper grouping']
      },
      {
        id: 'level5-challenge2',
        title: 'Product Performance Analysis',
        description: 'Analyze product sales performance across categories',
        difficulty: 'advanced',
        question: 'For each product category, show: total units sold, revenue, profit, top-selling product, and category rank by revenue',
        hints: [
          'Use window functions for ranking',
          'Multiple levels of aggregation',
          'Combine GROUP BY with window functions'
        ],
        solution: `WITH category_stats AS (
  SELECT 
    p.category,
    SUM(oi.quantity) AS total_units,
    SUM(oi.quantity * oi.unit_price) AS revenue,
    SUM(oi.quantity * (oi.unit_price - p.cost)) AS profit
  FROM order_items oi
  JOIN products p ON oi.product_id = p.product_id
  JOIN orders o ON oi.order_id = o.order_id
  WHERE o.status = 'completed'
  GROUP BY p.category
),
product_sales AS (
  SELECT 
    p.category,
    p.name AS product_name,
    SUM(oi.quantity) AS units_sold,
    ROW_NUMBER() OVER (PARTITION BY p.category ORDER BY SUM(oi.quantity) DESC) AS rank_in_category
  FROM order_items oi
  JOIN products p ON oi.product_id = p.product_id
  JOIN orders o ON oi.order_id = o.order_id
  WHERE o.status = 'completed'
  GROUP BY p.category, p.name
)
SELECT 
  cs.category,
  cs.total_units,
  cs.revenue,
  cs.profit,
  ps.product_name AS top_product,
  RANK() OVER (ORDER BY cs.revenue DESC) AS category_rank
FROM category_stats cs
LEFT JOIN product_sales ps ON cs.category = ps.category AND ps.rank_in_category = 1
ORDER BY cs.revenue DESC;`,
        evaluationCriteria: ['Uses CTEs', 'Window functions', 'Multiple aggregations', 'Complex joins']
      },
      {
        id: 'level5-challenge3',
        title: 'Customer Segmentation',
        description: 'Segment customers based on purchasing behavior',
        difficulty: 'advanced',
        question: 'Create customer segments: VIP (>$5000), Regular ($1000-$5000), Casual (<$1000) with their characteristics',
        hints: [
          'Use CASE for segmentation',
          'Calculate customer metrics',
          'Group by segment for analysis'
        ],
        solution: `WITH customer_metrics AS (
  SELECT 
    c.customer_id,
    c.name,
    COUNT(DISTINCT o.order_id) AS order_count,
    SUM(oi.quantity * oi.unit_price) AS total_spent,
    MAX(o.order_date) AS last_order_date,
    MIN(o.order_date) AS first_order_date
  FROM customers c
  JOIN orders o ON c.customer_id = o.customer_id
  JOIN order_items oi ON o.order_id = oi.order_id
  WHERE o.status = 'completed'
  GROUP BY c.customer_id, c.name
)
SELECT 
  CASE
    WHEN total_spent > 5000 THEN 'VIP'
    WHEN total_spent >= 1000 THEN 'Regular'
    ELSE 'Casual'
  END AS segment,
  COUNT(*) AS customer_count,
  AVG(order_count) AS avg_orders,
  AVG(total_spent) AS avg_spending,
  AVG(EXTRACT(DAY FROM (last_order_date - first_order_date))) AS avg_customer_lifespan_days
FROM customer_metrics
GROUP BY 
  CASE
    WHEN total_spent > 5000 THEN 'VIP'
    WHEN total_spent >= 1000 THEN 'Regular'
    ELSE 'Casual'
  END
ORDER BY avg_spending DESC;`,
        evaluationCriteria: ['Uses CTE', 'CASE segmentation', 'Date calculations', 'Multiple aggregates']
      },
      {
        id: 'level5-challenge4',
        title: 'Supply Chain Analysis',
        description: 'Analyze supplier performance and geographic distribution',
        difficulty: 'advanced',
        question: 'For each supplier country, show: supplier count, products supplied, total revenue generated, and average product margin',
        hints: [
          'Join suppliers with products and order items',
          'Group by country',
          'Calculate margins'
        ],
        solution: `SELECT 
  s.country AS supplier_country,
  COUNT(DISTINCT s.supplier_id) AS supplier_count,
  COUNT(DISTINCT p.product_id) AS products_supplied,
  SUM(oi.quantity * oi.unit_price) AS total_revenue,
  AVG(oi.unit_price - p.cost) AS avg_margin_per_unit
FROM suppliers s
JOIN products p ON s.supplier_id = p.supplier_id
JOIN order_items oi ON p.product_id = oi.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.status = 'completed'
GROUP BY s.country
ORDER BY total_revenue DESC;`,
        evaluationCriteria: ['Multiple joins', 'Multiple COUNT DISTINCT', 'Calculated averages', 'Proper grouping']
      },
      {
        id: 'level5-challenge5',
        title: 'Executive Dashboard Query',
        description: 'Create a single comprehensive query for executive reporting',
        difficulty: 'advanced',
        question: 'Build a query showing: total customers, active customers (ordered in last 90 days), total revenue, profit, top category, and growth rate (current month vs previous month)',
        hints: [
          'Use multiple CTEs for different metrics',
          'Calculate growth rates',
          'Combine all metrics in final SELECT'
        ],
        solution: `WITH current_month AS (
  SELECT 
    SUM(oi.quantity * oi.unit_price) AS revenue,
    SUM(oi.quantity * (oi.unit_price - p.cost)) AS profit
  FROM order_items oi
  JOIN products p ON oi.product_id = p.product_id
  JOIN orders o ON oi.order_id = o.order_id
  WHERE o.status = 'completed'
    AND EXTRACT(MONTH FROM o.order_date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM o.order_date) = EXTRACT(YEAR FROM CURRENT_DATE)
),
previous_month AS (
  SELECT 
    SUM(oi.quantity * oi.unit_price) AS revenue
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.order_id
  WHERE o.status = 'completed'
    AND o.order_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
    AND o.order_date < DATE_TRUNC('month', CURRENT_DATE)
),
top_category AS (
  SELECT p.category
  FROM order_items oi
  JOIN products p ON oi.product_id = p.product_id
  JOIN orders o ON oi.order_id = o.order_id
  WHERE o.status = 'completed'
    AND EXTRACT(MONTH FROM o.order_date) = EXTRACT(MONTH FROM CURRENT_DATE)
  GROUP BY p.category
  ORDER BY SUM(oi.quantity * oi.unit_price) DESC
  LIMIT 1
)
SELECT 
  (SELECT COUNT(*) FROM customers) AS total_customers,
  (SELECT COUNT(DISTINCT customer_id) FROM orders 
   WHERE order_date >= CURRENT_DATE - INTERVAL '90 days') AS active_customers,
  cm.revenue AS current_month_revenue,
  cm.profit AS current_month_profit,
  (SELECT category FROM top_category) AS top_category,
  CASE 
    WHEN pm.revenue > 0 
    THEN ((cm.revenue - pm.revenue) / pm.revenue * 100)
    ELSE 0
  END AS growth_rate_pct
FROM current_month cm, previous_month pm;`,
        evaluationCriteria: ['Multiple CTEs', 'Date calculations', 'Growth rate formula', 'Subqueries', 'Complex logic']
      }
    ]
  }
};

// Generate hint for a challenge
export function generateHint(challengeId: string, hintLevel: number = 1): SQLHint | null {
  const challenge = findChallengeById(challengeId);
  if (!challenge || !challenge.hints || challenge.hints.length === 0) {
    return null;
  }
  
  const hintIndex = Math.min(hintLevel - 1, challenge.hints.length - 1);
  const hint = challenge.hints[hintIndex];
  
  return {
    level: hintLevel,
    hint: hint,
    nextHint: hintIndex < challenge.hints.length - 1 ? challenge.hints[hintIndex + 1] : undefined
  };
}

// Explain a SQL query
export function explainQuery(query: string): SQLExplanation {
  const lines = query.split('\n').filter(line => line.trim().length > 0);
  const lineByLine: Array<{ line: string; explanation: string }> = [];
  const concepts: string[] = [];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim().toUpperCase();
    let explanation = '';
    
    if (trimmed.startsWith('SELECT')) {
      explanation = 'SELECT clause: Specifies which columns to retrieve from the database';
      if (!concepts.includes('SELECT')) concepts.push('SELECT');
    } else if (trimmed.startsWith('FROM')) {
      explanation = 'FROM clause: Specifies the table(s) to query data from';
      if (!concepts.includes('FROM')) concepts.push('FROM');
    } else if (trimmed.startsWith('WHERE')) {
      explanation = 'WHERE clause: Filters rows based on specified conditions';
      if (!concepts.includes('WHERE')) concepts.push('WHERE');
    } else if (trimmed.startsWith('JOIN') || trimmed.includes('JOIN')) {
      explanation = 'JOIN: Combines rows from multiple tables based on related columns';
      if (!concepts.includes('JOIN')) concepts.push('JOIN');
    } else if (trimmed.startsWith('GROUP BY')) {
      explanation = 'GROUP BY: Groups rows that have the same values in specified columns';
      if (!concepts.includes('GROUP BY')) concepts.push('GROUP BY');
    } else if (trimmed.startsWith('HAVING')) {
      explanation = 'HAVING: Filters groups created by GROUP BY (similar to WHERE but for groups)';
      if (!concepts.includes('HAVING')) concepts.push('HAVING');
    } else if (trimmed.startsWith('ORDER BY')) {
      explanation = 'ORDER BY: Sorts the result set by specified column(s)';
      if (!concepts.includes('ORDER BY')) concepts.push('ORDER BY');
    } else if (trimmed.startsWith('WITH')) {
      explanation = 'WITH (CTE): Common Table Expression - creates a temporary named result set';
      if (!concepts.includes('CTE')) concepts.push('CTE');
    } else if (trimmed.includes('OVER(')) {
      explanation = 'Window Function: Performs calculation across a set of rows related to current row';
      if (!concepts.includes('Window Functions')) concepts.push('Window Functions');
    } else if (trimmed.includes('CASE')) {
      explanation = 'CASE: Conditional logic - returns different values based on conditions';
      if (!concepts.includes('CASE')) concepts.push('CASE');
    } else {
      explanation = 'Part of the query logic';
    }
    
    lineByLine.push({ line: line.trim(), explanation });
  });
  
  return {
    query,
    explanation: `This query ${generatePlainEnglishExplanation(query)}`,
    lineByLine,
    concepts
  };
}

// Generate plain English explanation
function generatePlainEnglishExplanation(query: string): string {
  const upper = query.toUpperCase();
  let explanation = '';
  
  if (upper.includes('SELECT') && upper.includes('FROM')) {
    explanation = 'retrieves data';
    if (upper.includes('WHERE')) explanation += ' and filters it';
    if (upper.includes('JOIN')) explanation += ' by combining multiple tables';
    if (upper.includes('GROUP BY')) explanation += ', groups the results';
    if (upper.includes('ORDER BY')) explanation += ', and sorts them';
  }
  
  return explanation || 'performs database operations';
}

// Debug SQL query
export function debugQuery(query: string, expectedOutput?: string): {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
} {
  const errors: string[] = [];
  const suggestions: string[] = [];
  const upper = query.toUpperCase().trim();
  
  // Basic syntax checks
  if (!upper.includes('SELECT')) {
    errors.push('Missing SELECT statement');
    suggestions.push('Every query must start with SELECT');
  }
  
  if (!upper.includes('FROM') && !upper.includes('WITH')) {
    errors.push('Missing FROM clause or CTE');
    suggestions.push('Add a FROM clause specifying the table name');
  }
  
  // Check for common mistakes
  if (upper.includes('WHERE') && upper.indexOf('WHERE') < upper.indexOf('FROM')) {
    errors.push('WHERE clause appears before FROM');
    suggestions.push('FROM must come before WHERE');
  }
  
  if (upper.includes('GROUP BY') && !upper.includes('SELECT')) {
    errors.push('GROUP BY used without SELECT');
    suggestions.push('GROUP BY requires a SELECT statement');
  }
  
  if (upper.includes('HAVING') && !upper.includes('GROUP BY')) {
    errors.push('HAVING used without GROUP BY');
    suggestions.push('HAVING can only be used with GROUP BY');
  }
  
  // Check for SQL injection patterns (basic)
  if (query.includes(';') && query.split(';').length > 2) {
    errors.push('Multiple statements detected');
    suggestions.push('Execute one query at a time for security');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    suggestions
  };
}

// Find challenge by ID
function findChallengeById(challengeId: string): SQLChallenge | null {
  for (const level of Object.values(SQL_LEVELS)) {
    const challenge = level.challenges.find(c => c.id === challengeId);
    if (challenge) return challenge;
  }
  return null;
}

// Generate context-aware AI mentor response
export function generateChatResponse(
  message: string,
  challengeId: string,
  userQuery?: string
): string {
  const challenge = findChallengeById(challengeId);
  if (!challenge) {
    return 'I apologize, but I couldn\'t find the current challenge. Please make sure you have a challenge selected.';
  }

  const lowerMessage = message.toLowerCase();
  
  // Detect intent based on trigger words
  const wantsHint = lowerMessage.includes('hint') || lowerMessage.includes('clue') || lowerMessage.includes('tip');
  const wantsExplanation = lowerMessage.includes('explain') || lowerMessage.includes('what is') || lowerMessage.includes('how does');
  const wantsHelp = lowerMessage.includes('help') || lowerMessage.includes('stuck') || lowerMessage.includes('assist') || lowerMessage.includes('support');
  const wantsProblemExplanation = lowerMessage.includes('explain the problem') || lowerMessage.includes('what is the problem') || lowerMessage.includes('what am i supposed to do');
  const wantsGuidance = lowerMessage.includes('how do i') || lowerMessage.includes('what should') || lowerMessage.includes('guide me') || lowerMessage.includes('walk me through');

  // Build context-aware response
  let response = '';

  if (wantsProblemExplanation || wantsExplanation) {
    // Explain the problem and what needs to be done
    response = `**Understanding the Challenge:**\n\n`;
    response += `${challenge.description}\n\n`;
    response += `**The Task:**\n${challenge.question}\n\n`;
    
    if (challenge.industryContext) {
      response += `**Why This Matters:**\n${challenge.industryContext}\n\n`;
    }
    
    if (challenge.expectedOutput) {
      response += `**Expected Result:**\n${challenge.expectedOutput}\n\n`;
    }
    
    response += `**Key Concepts to Use:**\n`;
    if (challenge.hints && challenge.hints.length > 0) {
      response += `- ${challenge.hints[0]}\n`;
      if (challenge.hints.length > 1) {
        response += `- ${challenge.hints[1]}\n`;
      }
    }
    
    if (challenge.schema) {
      response += `\n**Database Schema Available:**\nThe challenge provides a schema with the necessary tables. Review it to understand the table structure and relationships.`;
    }
  } else if (wantsHint) {
    // Provide progressive hints
    const hintLevel = userQuery ? 2 : 1; // If they have a query, give level 2 hint
    const hint = generateHint(challengeId, hintLevel);
    
    if (hint) {
      response = `**Hint ${hintLevel}:**\n${hint.hint}\n\n`;
      if (hint.nextHint) {
        response += `💡 Need more help? Ask for another hint or try the "Get Hint" button for progressive guidance.`;
      }
    } else {
      response = `**Hint:**\n${challenge.hints[0] || 'Think about the key SQL concepts needed for this challenge.'}\n\n`;
      if (challenge.hints.length > 1) {
        response += `**Next Step:**\n${challenge.hints[1]}\n\n`;
      }
      response += `💡 You can ask for more specific hints or use the "Get Hint" button for progressive guidance.`;
    }
  } else if (wantsGuidance || wantsHelp) {
    // Provide step-by-step guidance
    response = `**Let me guide you through this challenge:**\n\n`;
    response += `**Challenge:** ${challenge.title}\n\n`;
    response += `**What you need to do:**\n${challenge.question}\n\n`;
    
    response += `**Step-by-step approach:**\n`;
    if (challenge.hints && challenge.hints.length > 0) {
      challenge.hints.slice(0, 3).forEach((hint, idx) => {
        response += `${idx + 1}. ${hint}\n`;
      });
    }
    
    if (userQuery && userQuery.trim()) {
      response += `\n**Your current query:**\n\`\`\`sql\n${userQuery}\n\`\`\`\n\n`;
      response += `💡 You can use the "Debug" button to check for syntax errors, or "Explain Query" to understand what your query does.`;
    } else {
      response += `\n**Getting Started:**\n`;
      response += `1. Review the database schema to understand the table structure\n`;
      response += `2. Look at the sample data to see what you're working with\n`;
      response += `3. Start with a basic SELECT statement\n`;
      response += `4. Build your query step by step\n\n`;
      response += `💡 Need a hint? Just ask for "hint" or use the hint button!`;
    }
    
    if (challenge.resources && challenge.resources.length > 0) {
      response += `\n\n**Learning Resources:**\n`;
      challenge.resources.forEach((resource, idx) => {
        response += `${idx + 1}. ${resource.title} - ${resource.description}\n`;
      });
    }
  } else {
    // General helpful response
    response = `I'm here to help you with **${challenge.title}**!\n\n`;
    response += `**What you can ask me:**\n`;
    response += `- "Explain the problem" - I'll break down what you need to do\n`;
    response += `- "Hint" - I'll give you a helpful hint\n`;
    response += `- "Help" or "Guide me" - I'll walk you through step-by-step\n\n`;
    response += `**Current Challenge:**\n${challenge.question}\n\n`;
    
    if (challenge.expectedOutput) {
      response += `**Expected Output:**\n${challenge.expectedOutput}\n\n`;
    }
    
    response += `💡 Try asking: "explain the problem", "hint", or "help" for more specific assistance!`;
  }

  return response;
}

// Get level by number
export function getLevel(levelNumber: number): SQLLevel | null {
  return SQL_LEVELS[levelNumber] || null;
}

// Get all levels
export function getAllLevels(): SQLLevel[] {
  return Object.values(SQL_LEVELS);
}

