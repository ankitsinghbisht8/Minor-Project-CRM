import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../../../components/ui/card'
import { AnalyticsHeader } from './components/AnalyticsHeader'
import { KpiCard } from './components/KpiCard'
import { ChartCard } from './components/ChartCard'
import { DataTable } from './components/DataTable'
import { DetailsModal } from './components/DetailsModal'
import {
  revenueTrend,
  salesByCategory,
  planDistribution,
  activeUsersGrowth,
  engagementHeatmap,
  funnelSteps,
  tableRows,
  campaignFunnel,
  engagementTrendMulti,
  campaignComparison,
  channelPerformance,
  segmentPerformance,
  segmentGrowthTrend,
  segmentEngagementHeatmap,
  retentionCurve,
  responseTimeHistogram,
  demographicsBreakdown,
  geoAudienceHeatmap,
  churnTrend,
  kpiSparks,
  campaignsTable,
  segmentsTable,
  roiBubbleData,
} from './data/mock'

// Analytics dashboard page: responsive layout with header, KPIs, charts, insights, and data table.
const Analytics = () => {
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [region, setRegion] = useState('All')
  const [category, setCategory] = useState('All')
  const [selectedRow, setSelectedRow] = useState(null)
  const [live, setLive] = useState(false)
  const [globalQuery, setGlobalQuery] = useState('')
  const [filters, setFilters] = useState({ datePreset: 'Last 30 Days', granularity: 'Daily', lifetime: false })
  const [refreshKey, setRefreshKey] = useState(0)

  // In a real app, use dateRange/region/category to fetch filtered data.
  const kpis = useMemo(
    () => [
      { title: 'Revenue', value: '$128,420', delta: '+5.4%', tone: 'up', key: 'revenue' },
      { title: 'Active Users', value: '8,731', delta: '+2.1%', tone: 'up', key: 'activeUsers' },
      { title: 'Conversion Rate', value: '3.7%', delta: '+0.4%', tone: 'up', key: 'conversion' },
      { title: 'Retention', value: '86%', delta: '-0.6%', tone: 'down', key: 'retention' },
    ],
    [refreshKey, region, category, dateRange]
  )

  const charts = useMemo(
    () => ({
      // legacy
      revenueTrend: revenueTrend(),
      salesByCategory: salesByCategory(),
      planDistribution: planDistribution(),
      activeUsersGrowth: activeUsersGrowth(),
      engagementHeatmap: engagementHeatmap(),
      funnelSteps: funnelSteps(),
      tableRows: tableRows(),
      // campaigns & segments
      campaignFunnel: campaignFunnel(),
      engagementTrendMulti: engagementTrendMulti(),
      campaignComparison: campaignComparison(),
      channelPerformance: channelPerformance(),
      segmentPerformance: segmentPerformance(),
      segmentGrowthTrend: segmentGrowthTrend(),
      segmentEngagementHeatmap: segmentEngagementHeatmap(),
      retentionCurve: retentionCurve(),
      responseTimeHistogram: responseTimeHistogram(),
      demographicsBreakdown: demographicsBreakdown(),
      geoAudienceHeatmap: geoAudienceHeatmap(),
      churnTrend: churnTrend(),
      kpiSparks: kpiSparks(),
    }),
    [refreshKey, region, category, dateRange, filters]
  )

  const [group, setGroup] = useState('campaigns')

  return (
    <div className="min-h-screen transition-colors relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white/70 backdrop-blur-md border border-gray-200 dark:bg-gray-900/40 dark:border-gray-700 shadow-md rounded-xl p-3">
          <AnalyticsHeader
            filters={filters}
            onChange={setFilters}
            onRefresh={() => setRefreshKey((v) => v + 1)}
            onExport={() => console.log('Export with filters', filters)}
          />
        </div>

        {/* KPI Cards */}
        <div className="mt-4 flex flex-wrap gap-2">
          {['campaigns','segments','timing','audience','retention','advanced'].map(g => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={[
                'px-3 py-2 rounded-lg text-sm border transition-colors',
                group === g ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              ].join(' ')}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>

        <motion.div layout className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Total users', value: '48,920', delta: '+3.2%', tone: 'up', spark: charts.kpiSparks.totalUsers },
            { title: 'Campaigns sent', value: '1,284', delta: '+1.4%', tone: 'up', spark: charts.kpiSparks.campaignsSent },
            { title: 'Delivery rate', value: '95.2%', delta: '+0.8%', tone: 'up', spark: charts.kpiSparks.delivery },
            { title: 'Open rate', value: '42.8%', delta: '+1.2%', tone: 'up', spark: charts.kpiSparks.open },
            { title: 'CTR', value: '7.3%', delta: '+0.6%', tone: 'up', spark: charts.kpiSparks.ctr },
            { title: 'Conversion', value: '3.1%', delta: '+0.3%', tone: 'up', spark: charts.kpiSparks.conversion },
            { title: 'Unsubscribe', value: '0.9%', delta: '+0.1%', tone: 'down', spark: charts.kpiSparks.unsubscribe },
          ].slice(0, 4).map((kpi, idx) => (
            <KpiCard key={kpi.title} {...kpi} index={idx} />
          ))}
        </motion.div>

        {/* Charts */}
        {group === 'campaigns' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Campaign Funnel" type="funnel" data={charts.campaignFunnel} height={360} />
            <ChartCard title="Engagement Trend" type="line" data={charts.engagementTrendMulti} height={360} />
            <ChartCard title="Campaign Comparison" type="bar" data={charts.campaignComparison} height={360} />
            <ChartCard title="Channel Performance" type="pie" data={charts.channelPerformance} height={360} />
          </div>
        )}
        {group === 'segments' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Segment Performance" type="bar" data={charts.segmentPerformance} height={360} />
            <ChartCard title="Segment Growth" type="area" data={charts.segmentGrowthTrend} height={360} />
            <ChartCard title="Segment Engagement Heatmap" type="heatmap" data={charts.segmentEngagementHeatmap} height={360} className="lg:col-span-2" />
          </div>
        )}
        {group === 'timing' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Engagement Heatmap" type="heatmap" data={charts.engagementHeatmap} height={360} />
            <ChartCard title="Response Time Distribution" type="bar" data={charts.responseTimeHistogram} height={360} />
          </div>
        )}
        {group === 'audience' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Geo Audience Heatmap" type="heatmap" data={charts.geoAudienceHeatmap} height={360} />
            <ChartCard title="Demographics" type="pie" data={charts.demographicsBreakdown} height={360} />
          </div>
        )}
        {group === 'retention' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Cohort Retention" type="line" data={charts.retentionCurve} height={360} />
            <ChartCard title="Churn / Opt-out Trend" type="line" data={charts.churnTrend} height={360} />
          </div>
        )}
        {group === 'advanced' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="A/B Testing Results" type="bar" data={charts.campaignComparison} height={360} />
            <ChartCard title="Predictive Conversion Forecast" type="line" data={charts.engagementTrendMulti} height={360} />
            <ChartCard title="Campaign ROI (Bubble)" type="bubble" data={roiBubbleData()} height={360} />
          </div>
        )}

        {/* Advanced Insights moved into respective groups to avoid duplication */}

        {/* Data Table */}
        <Card className="mt-6 bg-white/40 dark:bg-white/5 backdrop-blur-xl backdrop-saturate-150 bg-clip-padding border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="px-5 pt-4">
            <input
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              placeholder="Search customers, deals, or accounts..."
              className="w-full md:w-96 h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm bg-white/80"
            />
          </div>
          {group === 'campaigns' && (
            <DataTable
              rows={campaignsTable()}
              columnsDef={[
                { key: 'id', header: 'ID' },
                { key: 'name', header: 'Campaign' },
                { key: 'channel', header: 'Channel' },
                { key: 'status', header: 'Status' },
                { key: 'sent', header: 'Sent' },
                { key: 'delivered', header: 'Delivered' },
                { key: 'openRate', header: 'Open %', format: (v) => `${v}%` },
                { key: 'ctr', header: 'CTR %', format: (v) => `${v}%` },
                { key: 'conversions', header: 'Conversions' },
              ]}
            />
          )}
          {group === 'segments' && (
            <DataTable
              rows={segmentsTable()}
              columnsDef={[
                { key: 'id', header: 'ID' },
                { key: 'name', header: 'Segment' },
                { key: 'size', header: 'Size' },
                { key: 'openRate', header: 'Open %', format: (v) => `${v}%` },
                { key: 'ctr', header: 'CTR %', format: (v) => `${v}%` },
                { key: 'conversionRate', header: 'Conv %', format: (v) => `${v}%` },
              ]}
            />
          )}
          {group !== 'campaigns' && group !== 'segments' && (
            <DataTable
              rows={charts.tableRows}
              onRowClick={(row) => setSelectedRow(row)}
            />
          )}
        </Card>

        <DetailsModal
          row={selectedRow}
          onClose={() => setSelectedRow(null)}
        />
      </div>
    </div>
  )
}

export default Analytics


