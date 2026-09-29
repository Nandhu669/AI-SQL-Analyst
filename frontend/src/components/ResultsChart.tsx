/**
 * ResultsChart.tsx — Visualizes query results as Bar, Line, or Pie charts.
 *
 * Uses Recharts — a React-native charting library with TypeScript support.
 *
 * Logic:
 *  - Auto-detects the first string column as the category axis (X / label)
 *  - Auto-detects the first numeric column as the value axis (Y / value)
 *  - Renders the selected chart type based on tab selection
 *
 * Day 3: receives mock rows
 * Day 4+: receives real rows from the API
 */

import { useState } from 'react'
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import type { QueryResult, ChartType } from '../types/query'

interface ResultsChartProps {
  result: QueryResult
}

// A palette of colours for the pie chart slices / bars
const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2']

export function ResultsChart({ result }: ResultsChartProps) {
  const [chartType, setChartType] = useState<ChartType>('bar')

  const { columns, rows } = result

  // ── Auto-detect axes ────────────────────────────────────────────────────────
  // Category (X axis / pie label): first column with string values
  // Value (Y axis / pie value): first column with numeric values

  const categoryKey = columns.find((col) =>
    rows.some((r) => typeof r[col] === 'string')
  ) ?? columns[0]

  const valueKey = columns.find((col) =>
    rows.some((r) => typeof r[col] === 'number')
  ) ?? columns[1]

  // Recharts needs plain objects — our rows already are, just type-cast
  const data = rows as Record<string, unknown>[]

  // ── Chart renderers ─────────────────────────────────────────────────────────

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey={categoryKey}
                tick={{ fontSize: 12 }}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey={valueKey} fill={COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey={categoryKey}
                tick={{ fontSize: 12 }}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={valueKey}
                stroke={COLORS[0]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                dataKey={valueKey}
                nameKey={categoryKey}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                }
                labelLine={true}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div style={styles.container}>
      {/* Tab bar */}
      <div style={styles.header}>
        <span style={styles.title}>Visualization</span>
        <div style={styles.tabs}>
          {(['bar', 'line', 'pie'] as ChartType[]).map((type) => (
            <button
              key={type}
              style={{
                ...styles.tab,
                ...(chartType === type ? styles.tabActive : {}),
              }}
              onClick={() => setChartType(type)}
            >
              {type === 'bar' ? '📊' : type === 'line' ? '📈' : '🥧'}{' '}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={styles.chartArea}>{renderChart()}</div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    background: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    background: '#f8fafc',
    borderBottom: '1px solid #e5e7eb',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: '#374151',
  },
  tabs: {
    display: 'flex',
    gap: 4,
  },
  tab: {
    padding: '4px 14px',
    fontSize: '0.8rem',
    fontWeight: 500,
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    background: '#fff',
    color: '#6b7280',
    cursor: 'pointer',
  },
  tabActive: {
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#2563eb',
    fontWeight: 600,
  },
  chartArea: {
    padding: '16px 8px',
  },
}
