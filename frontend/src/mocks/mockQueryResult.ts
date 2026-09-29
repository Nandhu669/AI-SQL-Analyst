/**
 * mockQueryResult.ts — Simulated API response for Day 3 UI development.
 *
 * WHY WE MOCK:
 * The real POST /api/v1/mcp/query route doesn't exist until Day 4.
 * We use this mock so we can build and test the full UI today.
 *
 * DAY 4 CHANGE:
 * Replace the `MOCK_RESULT` usage in App.tsx with a real fetch() call.
 * The shape stays exactly the same — zero changes to the UI components.
 */

import type { QueryResult } from '../types/query'

/** Example question this mock response answers */
export const MOCK_QUESTION =
  'Show me total sales by product for the last 30 days'

/**
 * Simulated result from the backend.
 * Matches the QueryResult interface exactly — swap for real API on Day 4.
 */
export const MOCK_RESULT: QueryResult = {
  sql: `SELECT
  product_name,
  SUM(amount) AS total_sales
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY product_name
ORDER BY total_sales DESC
LIMIT 10;`,
  columns: ['product_name', 'total_sales'],
  rows: [
    { product_name: 'Laptop Pro', total_sales: 48200 },
    { product_name: 'Wireless Mouse', total_sales: 31500 },
    { product_name: 'USB Hub', total_sales: 19800 },
    { product_name: 'Monitor 27"', total_sales: 17200 },
    { product_name: 'Keyboard RGB', total_sales: 14600 },
  ],
  executionTimeMs: 142,
  rowCount: 5,
}

/**
 * Simulate a network delay (1.5 seconds) to test loading states.
 * On Day 4, replace this with a real fetch() to /api/v1/mcp/query.
 */
export function simulateQuery(_question: string): Promise<QueryResult> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_RESULT), 1500)
  })
}
