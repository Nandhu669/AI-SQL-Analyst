/**
 * ResultsChart.tsx — Adaptive multi-metric visualization component.
 *
 * Impeccable Craft Standards:
 *  - Crisp SVG icons (lucide-react), zero unicode emoji
 *  - Dynamic axis & metric dimension selection
 *  - Accessible dark-slate theme tooltips & gridlines
 *  - Formatted currencies, percentages, and integer ticks
 */

import { useState, useMemo } from 'react'
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, SlidersHorizontal } from 'lucide-react'
import type { QueryResult, ChartType } from '../types/query'

interface ResultsChartProps {
  result: QueryResult
}

const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6']

export function ResultsChart({ result }: ResultsChartProps) {
  const [chartType, setChartType] = useState<ChartType>('bar')

  const { columns, rows } = result

  // ── Auto-discover numeric and string columns ─────────────────────────────────
  const { numericCols, stringCols } = useMemo(() => {
    const numCols: string[] = []
    const strCols: string[] = []

    columns.forEach((col) => {
      const hasNumber = rows.some((r) => typeof r[col] === 'number')
      const hasString = rows.some((r) => typeof r[col] === 'string')

      if (hasNumber) numCols.push(col)
      else if (hasString) strCols.push(col)
    })

    return { numericCols: numCols, stringCols: strCols }
  }, [columns, rows])

  const [selectedCategory, setSelectedCategory] = useState<string>(stringCols[0] ?? columns[0] ?? '')
  const [selectedValue, setSelectedValue] = useState<string>(numericCols[0] ?? columns[1] ?? '')

  // Keep state updated if columns change
  const activeCategory = stringCols.includes(selectedCategory) ? selectedCategory : (stringCols[0] ?? columns[0])
  const activeValue = numericCols.includes(selectedValue) ? selectedValue : (numericCols[0] ?? columns[1])

  if (!numericCols.length || rows.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <span style={styles.emptyText}>
          No numeric metrics detected in this dataset to plot on a chart. Switch to the Data Table view to inspect records.
        </span>
      </div>
    )
  }

  // Format tick numbers nicely
  const formatTick = (val: unknown) => {
    if (typeof val === 'number') {
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
      if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
      return val.toLocaleString()
    }
    return String(val ?? '')
  }

  const data = rows as Record<string, unknown>[]

  return (
    <div style={styles.card}>
      {/* Header with Type Switcher & Axis Selectors */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.chartTypeGroup}>
            <button
              style={{
                ...styles.typeBtn,
                backgroundColor: chartType === 'bar' ? 'var(--accent-primary-subtle)' : 'transparent',
                borderColor: chartType === 'bar' ? 'var(--accent-primary-border)' : 'var(--border-subtle)',
                color: chartType === 'bar' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
              onClick={() => setChartType('bar')}
              title="Bar Chart"
            >
              <BarChart3 size={13} />
              <span>Bar</span>
            </button>

            <button
              style={{
                ...styles.typeBtn,
                backgroundColor: chartType === 'line' ? 'var(--accent-primary-subtle)' : 'transparent',
                borderColor: chartType === 'line' ? 'var(--accent-primary-border)' : 'var(--border-subtle)',
                color: chartType === 'line' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
              onClick={() => setChartType('line')}
              title="Line Chart"
            >
              <LineIcon size={13} />
              <span>Line</span>
            </button>

            <button
              style={{
                ...styles.typeBtn,
                backgroundColor: chartType === 'pie' ? 'var(--accent-primary-subtle)' : 'transparent',
                borderColor: chartType === 'pie' ? 'var(--accent-primary-border)' : 'var(--border-subtle)',
                color: chartType === 'pie' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
              onClick={() => setChartType('pie')}
              title="Pie Chart"
            >
              <PieIcon size={13} />
              <span>Pie</span>
            </button>
          </div>
        </div>

        {/* Dynamic Metric & Dimension Selectors */}
        <div style={styles.headerRight}>
          <div style={styles.selectorGroup}>
            <SlidersHorizontal size={11} style={{ color: 'var(--text-muted)' }} />
            <label style={styles.selectorLabel}>X:</label>
            <select
              style={styles.select}
              value={activeCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="X-axis category column"
            >
              {stringCols.concat(numericCols).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <label style={styles.selectorLabel}>Metric:</label>
            <select
              style={styles.select}
              value={activeValue}
              onChange={(e) => setSelectedValue(e.target.value)}
              aria-label="Y-axis metric column"
            >
              {numericCols.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={styles.canvasWrapper}>
        <ResponsiveContainer width="100%" height={290}>
          {chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 12, right: 16, left: 8, bottom: 44 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey={activeCategory}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={{ stroke: '#334155' }}
                angle={-25}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={{ stroke: '#334155' }}
                tickFormatter={formatTick}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: '#f8fafc',
                  fontSize: 12,
                }}
              />
              <Bar dataKey={activeValue} fill={PALETTE[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 12, right: 16, left: 8, bottom: 44 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey={activeCategory}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={{ stroke: '#334155' }}
                angle={-25}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={{ stroke: '#334155' }}
                tickFormatter={formatTick}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: '#f8fafc',
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey={activeValue}
                stroke={PALETTE[1]}
                strokeWidth={2.5}
                dot={{ r: 4, fill: PALETTE[1] }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                dataKey={activeValue}
                nameKey={activeCategory}
                cx="50%"
                cy="50%"
                outerRadius={95}
                innerRadius={35}
                paddingAngle={3}
                label={({ name, percent }: { name?: string; percent?: number }) =>
                  `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: '#f8fafc',
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: 10 }} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    backgroundColor: 'var(--bg-surface-elevated)',
    borderBottom: '1px solid var(--border-subtle)',
    flexWrap: 'wrap',
    gap: 8,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  chartTypeGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'var(--bg-canvas)',
    padding: 2,
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-subtle)',
  },
  typeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 8px',
    border: '1px solid transparent',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.72rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  selectorGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.72rem',
  },
  selectorLabel: {
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
  select: {
    padding: '3px 6px',
    backgroundColor: 'var(--bg-canvas)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '0.72rem',
    fontFamily: 'var(--font-mono)',
  },
  canvasWrapper: {
    padding: '12px 14px 6px',
  },
  emptyContainer: {
    padding: '32px 16px',
    textAlign: 'center',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
  },
  emptyText: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
}
