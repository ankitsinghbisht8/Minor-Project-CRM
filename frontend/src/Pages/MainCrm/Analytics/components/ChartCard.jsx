import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ResponsiveLine } from '@nivo/line'
import { ResponsiveBar } from '@nivo/bar'
import { ResponsivePie } from '@nivo/pie'
import { ResponsiveAreaBump } from '@nivo/bump'
import { ResponsiveHeatMap } from '@nivo/heatmap'
import { ResponsiveFunnel } from '@nivo/funnel'
import { ResponsiveScatterPlot } from '@nivo/scatterplot'
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card'

// Shared color palette to keep legends and charts in sync (Nivo Set2)
const SET2_COLORS = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494','#b3b3b3']

const ChartBody = ({ type, data, height, onElementClick, isDarkMode }) => {
  const commonTheme = {
    textColor: isDarkMode ? '#d1d5db' : '#6b7280',
    grid: {
      line: { stroke: isDarkMode ? '#374151' : '#e5e7eb', strokeWidth: 1 },
    },
    tooltip: { 
      container: { 
        background: isDarkMode ? '#374151' : 'white', 
        color: isDarkMode ? '#f9fafb' : '#111827', 
        fontSize: 12, 
        border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb', 
        borderRadius: 8, 
        boxShadow: '0 6px 20px rgba(0,0,0,0.08)', 
        padding: 8 
      } 
    },
    crosshair: { line: { stroke: isDarkMode ? '#6b7280' : '#9ca3af', strokeWidth: 1, strokeOpacity: 0.6 } },
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
          curve="monotoneX"
          enableArea
          areaBaselineValue={0}
          areaOpacity={0.08}
          lineWidth={2.5}
          pointSize={6}
          pointBorderWidth={2}
          pointBorderColor="#ffffff"
          enableSlices="x"
          useMesh
          animate
          motionConfig="wobbly"
          theme={commonTheme}
          colors={SET2_COLORS}
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
          margin={{ top: 20, right: 20, bottom: 76, left: 40 }}
          padding={0.3}
          enableGridY
          theme={commonTheme}
          colors={SET2_COLORS}
          borderRadius={2}
          borderColor={{ from: 'color', modifiers: [['darker', 1.2]] }}
          labelSkipWidth={16}
          labelSkipHeight={12}
          animate
          motionConfig="wobbly"
          legends={[{
            dataFrom: 'keys',
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 56,
            itemsSpacing: 10,
            itemDirection: 'left-to-right',
            itemWidth: 80,
            itemHeight: 16,
            itemOpacity: 0.7,
            symbolSize: 10,
            effects: [{ on: 'hover', style: { itemOpacity: 1 } }]
          }]}
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
          sortByValue
          activeOuterRadiusOffset={8}
          cornerRadius={3}
          theme={commonTheme}
          colors={SET2_COLORS}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#6b7280"
          arcLinkLabelsThickness={1}
          arcLinkLabelsColor={{ from: 'color' }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
          animate
          motionConfig="wobbly"
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
          colors={SET2_COLORS}
          blendMode="multiply"
          lineWidth={2}
          animate
          motionConfig="gentle"
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
          margin={{ top: 20, right: 20, bottom: 84, left: 40 }}
          valueFormat=">-.2s"
          axisTop={null}
          axisRight={null}
          axisBottom={{}}
          axisLeft={{}}
          theme={commonTheme}
          colors={{ type: 'sequential', scheme: 'greens' }}
          hoverTarget="cell"
          animate
          motionConfig="gentle"
          legends={[{
            anchor: 'bottom',
            translateX: 0,
            translateY: 56,
            length: 200,
            thickness: 10,
            direction: 'row',
            tickPosition: 'after',
            tickSize: 3,
            tickSpacing: 4,
            tickOverlap: false,
            title: 'Intensity →',
            titleAlign: 'start',
            titleOffset: 4
          }]}
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
          valueFormat=">-.2s"
          spacing={8}
          borderWidth={1}
          borderColor={{ from: 'color', modifiers: [['darker', 0.5]] }}
          animate
          motionConfig="gentle"
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
          colors={SET2_COLORS}
          nodeSize={n => Math.max(6, Math.min(40, n.data.size))}
          nodeBorderWidth={1}
          nodeBorderColor="#ffffff"
          enableGridX
          enableGridY
          animate
          motionConfig="wobbly"
          axisBottom={{ legend: 'CTR %', legendOffset: 36, legendPosition: 'middle' }}
          axisLeft={{ legend: 'Conversion %', legendOffset: -44, legendPosition: 'middle' }}
          legends={[{
            anchor: 'bottom-right',
            direction: 'column',
            translateX: 0,
            translateY: 40,
            itemWidth: 80,
            itemHeight: 16,
            itemsSpacing: 4,
            symbolSize: 10,
            symbolShape: 'circle'
          }]}
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

export const ChartCard = ({ title, subtitle, type, data, height = 300, className, onElementClick, visualMode = '2d', isDarkMode }) => {
  const [localMode] = useState(visualMode)
  const [isHidden, setIsHidden] = useState(false)

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className={[className, 'bg-white/40 dark:bg-white/5 backdrop-blur-xl backdrop-saturate-150 bg-clip-padding border border-white/60 dark:border-white/10 shadow-[-10px_12px_28px_rgba(0,0,0,0.10)] ring-1 ring-white/40 dark:ring-white/5 hover:shadow-[12px_-10px_28px_rgba(0,0,0,0.14)] transition-shadow duration-300'].filter(Boolean).join(' ')}>
        <CardHeader className="border-b border-white/60 dark:border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>{title}</CardTitle>
              {subtitle && <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsHidden((v) => !v)}
                className={[
                  'px-2 py-1 rounded-lg text-xs border transition-all duration-200',
                  isHidden
                    ? 'bg-gradient-to-r from-orange-300 via-pink-400 to-purple-500 text-white border-transparent hover:shadow-lg hover:-translate-y-0.5'
                    : isDarkMode
                      ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                ].join(' ')}
                title={isHidden ? 'Show chart' : 'Hide chart'}
              >
                {isHidden ? 'Show' : 'Hide'}
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isHidden ? (
            <div className={`py-10 text-center text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Chart hidden</div>
          ) : (
            <>
              {type === 'line' && Array.isArray(data) && data.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-3 items-center">
                  {data.map((serie, i) => (
                    <div key={serie.id || i} className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: `var(--nivo-color-${i})` }}
                      />
                      <span>{serie.id || `Series ${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              )}
              <div
                onClick={(e) => e.stopPropagation()}
                className={localMode === '3d' ? 'shadow-xl ring-1 ring-black/5 rounded-lg' : ''}
                style={localMode === '3d' ? { transform: 'perspective(1000px) rotateX(6deg)', transformOrigin: 'center top' } : undefined}
              >
                <ChartBody type={type} data={data} height={height} onElementClick={onElementClick} isDarkMode={isDarkMode} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}


