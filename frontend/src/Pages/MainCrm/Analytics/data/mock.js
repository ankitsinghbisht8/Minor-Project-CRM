// Mock data generators to keep structure easily swappable with API

export const revenueTrend = () => [
  {
    id: 'revenue',
    data: [
      { x: 'Jan', y: 12 },
      { x: 'Feb', y: 14 },
      { x: 'Mar', y: 16 },
      { x: 'Apr', y: 18 },
      { x: 'May', y: 22 },
      { x: 'Jun', y: 24 },
      { x: 'Jul', y: 26 },
      { x: 'Aug', y: 28 },
      { x: 'Sep', y: 29 },
      { x: 'Oct', y: 31 },
      { x: 'Nov', y: 33 },
      { x: 'Dec', y: 36 },
    ],
  },
]

export const salesByCategory = () => [
  { category: 'CRM', sales: 54 },
  { category: 'Support', sales: 38 },
  { category: 'Marketing', sales: 28 },
]

export const planDistribution = () => [
  { id: 'Free', label: 'Free', value: 62 },
  { id: 'Pro', label: 'Pro', value: 28 },
  { id: 'Enterprise', label: 'Enterprise', value: 10 },
]

export const activeUsersGrowth = () => [
  {
    id: 'users',
    data: [
      { x: 'Jan', y: 900 },
      { x: 'Feb', y: 980 },
      { x: 'Mar', y: 1040 },
      { x: 'Apr', y: 1100 },
      { x: 'May', y: 1210 },
      { x: 'Jun', y: 1280 },
    ],
  },
]

export const engagementHeatmap = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return [
    {
      id: 'Week 1',
      data: days.map((d, i) => ({ x: d, y: 20 + i * 5 })),
    },
    {
      id: 'Week 2',
      data: days.map((d, i) => ({ x: d, y: 15 + i * 4 })),
    },
    {
      id: 'Week 3',
      data: days.map((d, i) => ({ x: d, y: 10 + i * 3 })),
    },
  ]
}

// Nivo Funnel expects an array of { id, value }
export const funnelSteps = () => ([
  { id: 'Visited', value: 1000 },
  { id: 'Signed up', value: 420 },
  { id: 'Activated', value: 260 },
  { id: 'Subscribed', value: 120 },
])

export const tableRows = () =>
  Array.from({ length: 20 }).map((_, i) => ({
    id: `CUST-${1000 + i}`,
    name: `Customer ${i + 1}`,
    plan: ['Free', 'Pro', 'Enterprise'][i % 3],
    region: ['NA', 'EU', 'APAC'][i % 3],
    mrr: (i % 3 === 0 ? 0 : (i % 3 === 1 ? 49 : 399)),
  }))

export const campaignsTable = () =>
  [
    { id: 'CMP-001', name: 'Spring Promo', channel: 'Email', status: 'Completed', sent: 12000, delivered: 11500, openRate: 46.2, ctr: 7.4, conversions: 410 },
    { id: 'CMP-002', name: 'Summer Boost', channel: 'SMS', status: 'Live', sent: 8000, delivered: 7760, openRate: 38.4, ctr: 5.2, conversions: 260 },
    { id: 'CMP-003', name: 'Fall Save', channel: 'Email', status: 'Completed', sent: 9500, delivered: 9220, openRate: 41.1, ctr: 6.1, conversions: 305 },
    { id: 'CMP-004', name: 'Holiday Blast', channel: 'WhatsApp', status: 'Completed', sent: 14000, delivered: 13560, openRate: 52.5, ctr: 9.1, conversions: 620 },
  ]

export const segmentsTable = () =>
  [
    { id: 'SEG-001', name: 'Power Users', size: 5200, openRate: 58.2, ctr: 10.4, conversionRate: 4.3 },
    { id: 'SEG-002', name: 'Trial', size: 3100, openRate: 34.8, ctr: 4.8, conversionRate: 1.6 },
    { id: 'SEG-003', name: 'Churn Risk', size: 1800, openRate: 22.4, ctr: 3.2, conversionRate: 0.9 },
    { id: 'SEG-004', name: 'Enterprise', size: 950, openRate: 46.9, ctr: 7.5, conversionRate: 3.1 },
  ]

// New mock datasets for campaign/segment analytics

export const campaignFunnel = () => ([
  { id: 'Delivered', value: 10000 },
  { id: 'Opened', value: 6300 },
  { id: 'Clicked', value: 2100 },
  { id: 'Converted', value: 780 },
])

export const engagementTrendMulti = () => ([
  {
    id: 'Opens',
    data: Array.from({ length: 12 }).map((_, i) => ({ x: `M${i + 1}`, y: 300 + Math.round(Math.random() * 120) }))
  },
  {
    id: 'Clicks',
    data: Array.from({ length: 12 }).map((_, i) => ({ x: `M${i + 1}`, y: 120 + Math.round(Math.random() * 80) }))
  },
  {
    id: 'Conversions',
    data: Array.from({ length: 12 }).map((_, i) => ({ x: `M${i + 1}`, y: 40 + Math.round(Math.random() * 40) }))
  },
])

export const campaignComparison = () => ([
  { category: 'Spring Promo', sales: 320 },
  { category: 'Summer Boost', sales: 410 },
  { category: 'Fall Save', sales: 280 },
  { category: 'Holiday Blast', sales: 510 },
])

export const channelPerformance = () => ([
  { id: 'Email', label: 'Email', value: 58 },
  { id: 'SMS', label: 'SMS', value: 22 },
  { id: 'WhatsApp', label: 'WhatsApp', value: 14 },
  { id: 'Push', label: 'Push', value: 6 },
])

export const segmentPerformance = () => ([
  { category: 'Power Users', sales: 78 },
  { category: 'Trial', sales: 32 },
  { category: 'Churn Risk', sales: 18 },
  { category: 'Enterprise', sales: 54 },
])

export const segmentGrowthTrend = () => ([
  {
    id: 'Power Users',
    data: Array.from({ length: 6 }).map((_, i) => ({ x: `M${i + 1}`, y: 200 + i * 30 }))
  },
  {
    id: 'Trial',
    data: Array.from({ length: 6 }).map((_, i) => ({ x: `M${i + 1}`, y: 120 + i * 10 }))
  },
])

export const segmentEngagementHeatmap = () => ([
  { id: 'Power Users', data: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => ({ x: d, y: 30 + i * 5 })) },
  { id: 'Trial', data: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => ({ x: d, y: 12 + i * 3 })) },
])

export const retentionCurve = () => ([
  { id: 'Cohort A', data: Array.from({ length: 8 }).map((_, i) => ({ x: `W${i + 1}`, y: Math.max(0, 100 - i * 8) })) },
  { id: 'Cohort B', data: Array.from({ length: 8 }).map((_, i) => ({ x: `W${i + 1}`, y: Math.max(0, 100 - i * 10) })) },
])

export const responseTimeHistogram = () => ([
  { category: '<1h', sales: 120 },
  { category: '1-3h', sales: 180 },
  { category: '3-6h', sales: 140 },
  { category: '6-12h', sales: 80 },
  { category: '12-24h', sales: 50 },
  { category: '>24h', sales: 30 },
])

export const demographicsBreakdown = () => ([
  { id: '18-24', label: '18-24', value: 18 },
  { id: '25-34', label: '25-34', value: 42 },
  { id: '35-44', label: '35-44', value: 22 },
  { id: '45+', label: '45+', value: 18 },
])

export const churnTrend = () => ([
  { id: 'Unsubscribes', data: Array.from({ length: 10 }).map((_, i) => ({ x: `W${i + 1}`, y: 8 + Math.round(Math.random()*6) })) },
])

export const kpiSparks = () => ({
  totalUsers: Array.from({ length: 12 }).map((_, i) => ({ x: i, y: 100 + i * 10 })),
  campaignsSent: Array.from({ length: 12 }).map((_, i) => ({ x: i, y: 20 + i * 2 })),
  delivery: Array.from({ length: 12 }).map((_, i) => ({ x: i, y: 92 + Math.random()*3 })),
  open: Array.from({ length: 12 }).map((_, i) => ({ x: i, y: 40 + Math.random()*10 })),
  ctr: Array.from({ length: 12 }).map((_, i) => ({ x: i, y: 6 + Math.random()*3 })),
  conversion: Array.from({ length: 12 }).map((_, i) => ({ x: i, y: 2 + Math.random()*2 })),
  unsubscribe: Array.from({ length: 12 }).map((_, i) => ({ x: i, y: 1 + Math.random()*1 })),
})

// Geo audience heatmap mock: rows = regions, columns = top countries
export const geoAudienceHeatmap = () => ([
  {
    id: 'North America',
    data: [
      { x: 'US', y: 120 },
      { x: 'CA', y: 48 },
      { x: 'MX', y: 36 },
    ],
  },
  {
    id: 'Europe',
    data: [
      { x: 'UK', y: 72 },
      { x: 'DE', y: 84 },
      { x: 'FR', y: 66 },
    ],
  },
  {
    id: 'APAC',
    data: [
      { x: 'IN', y: 110 },
      { x: 'SG', y: 44 },
      { x: 'AU', y: 38 },
    ],
  },
])

// Choropleth-ready audience data keyed by ISO A3 country codes
export const geoAudienceChoropleth = () => ([
  { id: 'USA', value: 120 },
  { id: 'CAN', value: 48 },
  { id: 'MEX', value: 36 },
  { id: 'GBR', value: 72 },
  { id: 'DEU', value: 84 },
  { id: 'FRA', value: 66 },
  { id: 'IND', value: 110 },
  { id: 'SGP', value: 44 },
  { id: 'AUS', value: 38 },
])


