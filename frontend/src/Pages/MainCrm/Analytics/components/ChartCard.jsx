import React from 'react'
import { motion } from 'framer-motion'
import { ResponsiveLine } from '@nivo/line'
import { ResponsiveBar } from '@nivo/bar'
import { ResponsivePie } from '@nivo/pie'
import { ResponsiveAreaBump } from '@nivo/bump'
import { ResponsiveHeatMap } from '@nivo/heatmap'
import { ResponsiveFunnel } from '@nivo/funnel'
import { ResponsiveScatterPlot } from '@nivo/scatterplot'
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card'


const ChartBody = ({ type, data, height, onElementClick }) => {
  const commonTheme = {
    textColor: '#6b7280',
    grid: {
      line: { stroke: '#e5e7eb', strokeWidth: 1 },
    },
    tooltip: { container: { background: 'white', color: '#111827', fontSize: 12 } },
  }

  if (type === 'line') {
    return (
      <div style={{ height }}>
        <ResponsiveLine
          data={data}
          margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear', stacked: false }}
          axisBottom={{ tickRotation: 0 }}
          axisLeft={{}}
          pointSize={6}
          useMesh
          theme={commonTheme}
          colors={{ scheme: 'set2' }}
          onClick={(point) => onElementClick && onElementClick(point)}
        />
      </div>
    )
  }
  if (type === 'bar') {
    return (
      <div style={{ height }}>
        <ResponsiveBar
          data={data}
          keys={['sales']}
          indexBy="category"
          margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
          padding={0.3}
          theme={commonTheme}
          colors={{ scheme: 'set2' }}
          onClick={(bar) => onElementClick && onElementClick(bar)}
        />
      </div>
    )
  }
  if (type === 'pie') {
    return (
      <div style={{ height }}>
        <ResponsivePie
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          innerRadius={0.6}
          padAngle={1}
          theme={commonTheme}
          colors={{ scheme: 'set2' }}
          onClick={(slice) => onElementClick && onElementClick(slice)}
        />
      </div>
    )
  }
  if (type === 'area') {
    return (
      <div style={{ height }}>
        <ResponsiveAreaBump
          data={data}
          margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
          spacing={8}
          theme={commonTheme}
          colors={{ scheme: 'set2' }}
          onClick={(serie) => onElementClick && onElementClick(serie)}
        />
      </div>
    )
  }
  if (type === 'heatmap') {
    return (
      <div style={{ height }}>
        <ResponsiveHeatMap
          data={data}
          margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
          valueFormat=">-.2s"
          axisTop={null}
          axisRight={null}
          axisBottom={{}}
          axisLeft={{}}
          theme={commonTheme}
          colors={{ type: 'sequential', scheme: 'greens' }}
          onClick={(cell) => onElementClick && onElementClick(cell)}
        />
      </div>
    )
  }
  if (type === 'funnel') {
    return (
      <div style={{ height }}>
        <ResponsiveFunnel
          data={data}
          margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
          theme={commonTheme}
          colors={{ scheme: 'set2' }}
          onClick={(step) => onElementClick && onElementClick(step)}
        />
      </div>
    )
  }
  if (type === 'bubble') {
    return (
      <div style={{ height }}>
        <ResponsiveScatterPlot
          data={[{ id: 'Campaigns', data: data.map(d => ({ x: d.x, y: d.y, size: d.size, id: d.id })) }]}
          margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
          blendMode="multiply"
          theme={commonTheme}
          colors={{ scheme: 'set2' }}
          nodeSize={n => Math.max(6, Math.min(40, n.data.size))}
          axisBottom={{ legend: 'CTR %', legendOffset: 36, legendPosition: 'middle' }}
          axisLeft={{ legend: 'Conversion %', legendOffset: -44, legendPosition: 'middle' }}
          tooltip={({ node }) => (
            <div style={{ background: 'white', padding: 6, border: '1px solid #eee', fontSize: 12 }}>
              <div><strong>{node.data.id}</strong></div>
              <div>CTR: {node.data.x}%</div>
              <div>Conversion: {node.data.y}%</div>
              <div>Cost: ${node.data.size}k</div>
            </div>
          )}
        />
      </div>
    )
  }
  
  return null
}

export const ChartCard = ({ title, subtitle, type, data, height = 300, className, onElementClick, visualMode = '2d' }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className={[className, 'bg-white/40 dark:bg-white/5 backdrop-blur-xl backdrop-saturate-150 bg-clip-padding border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-white/40 dark:ring-white/5 hover:shadow-xl transition-shadow'].filter(Boolean).join(' ')}>
        <CardHeader className="border-b border-white/60 dark:border-white/10">
          <CardTitle>{title}</CardTitle>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </CardHeader>
        <CardContent>
          <div onClick={(e) => e.stopPropagation()} className={visualMode === '3d' ? 'shadow-xl ring-1 ring-black/5 rounded-lg' : ''} style={visualMode === '3d' ? { transform: 'perspective(1000px) rotateX(6deg)', transformOrigin: 'center top' } : undefined}>
            <ChartBody type={type} data={data} height={height} onElementClick={onElementClick} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}


