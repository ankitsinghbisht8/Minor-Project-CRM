import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '../../../../components/ui/card'
import { ResponsiveLine } from '@nivo/line'

// Animated KPI card with value and delta.
export const KpiCard = ({ title, value, delta, tone = 'up', index = 0, spark = null }) => {
  const isUp = tone === 'up'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * index }}
    >
      <Card className="bg-white/40 dark:bg-white/5 backdrop-blur-xl backdrop-saturate-150 bg-clip-padding border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        <CardContent className="p-5">
          <p className="text-sm text-gray-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</span>
            <span className={isUp ? 'text-xs font-medium text-teal-600' : 'text-xs font-medium text-red-600'}>{delta}</span>
          </div>
          {spark && (
            <div className="mt-3 h-10">
              <ResponsiveLine
                data={[{ id: 'spark', data: spark }]}
                margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', stacked: false }}
                axisBottom={null}
                axisLeft={null}
                enablePoints={false}
                enableGridX={false}
                enableGridY={false}
                useMesh
                colors={isUp ? ['#0d9488'] : ['#dc2626']}
                theme={{ textColor: '#6b7280' }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}


