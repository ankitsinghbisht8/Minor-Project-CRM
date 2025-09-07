import React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Popover from '@radix-ui/react-popover'
import { Button } from '../../../../components/ui/button'

export const AnalyticsHeader = ({ filters, onChange, onRefresh, onExport, isDarkMode }) => {
  const presets = ['Today','Yesterday','Last 7 Days','Last 30 Days','Custom']
  const granularities = ['Hourly','Daily','Weekly','Monthly']
  const [campaignQuery, setCampaignQuery] = React.useState('')
  const [segmentQuery, setSegmentQuery] = React.useState('')
  const allCampaigns = ['Spring Promo','Summer Boost','Fall Save','Holiday Blast','Winter Warmup','Year End','Q1 Growth','Back to School']
  const allSegments = ['Power Users','Trial','Churn Risk','Enterprise','SMB','Inactive','High-value','New Users']
  const filteredCampaigns = allCampaigns.filter(c => c.toLowerCase().includes(campaignQuery.toLowerCase()))
  const filteredSegments = allSegments.filter(s => s.toLowerCase().includes(segmentQuery.toLowerCase()))

  const toggleArray = (key, value) => {
    const current = new Set(filters[key] || [])
    if (current.has(value)) current.delete(value); else current.add(value)
    onChange({ ...filters, [key]: Array.from(current) })
  }

  const setField = (key, value) => onChange({ ...filters, [key]: value })

  const chips = []
  ;['campaigns','campaignType','campaignStatus','abVariant','segments','region','deviceType','os','language','deliveryStatus','engagementLevel','conversionStatus','sendTime','stage','channelPref'].forEach(k => {
    (filters[k] || []).forEach(v => chips.push({ key: k, value: v }))
  })

  const removeChip = (chip) => {
    const list = (filters[chip.key] || []).filter(v => v !== chip.value)
    onChange({ ...filters, [chip.key]: list })
  }

  return (
    <div className="space-y-3">
      {/* Time-based filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          {presets.map(p => (
            <button key={p} onClick={() => setField('datePreset', p)} className={[
              'h-9 px-3 rounded-lg text-sm border transition-colors',
              filters.datePreset === p 
                ? isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-gray-900 text-white border-gray-900'
                : isDarkMode
                  ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            ].join(' ')}>{p}</button>
          ))}
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="secondary" className={isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : ''}>Granularity: {filters.granularity || 'Daily'}</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className={`z-[200] rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} p-1 shadow-xl`} sideOffset={8}>
              {granularities.map(g => (
                <DropdownMenu.Item key={g} className={`px-3 py-2 rounded-md text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'} cursor-pointer`} onClick={() => setField('granularity', g)}>
                  {g}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <button onClick={() => setField('lifetime', !filters.lifetime)} className={[
          'h-9 px-3 rounded-lg text-sm border transition-colors',
          filters.lifetime 
            ? 'bg-teal-600 text-white border-teal-600 hover:bg-teal-700' 
            : isDarkMode
              ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
        ].join(' ')}>{filters.lifetime ? 'Campaign Lifetime' : 'Specific Period'}</button>

        <div className="ml-auto flex items-center gap-2">
          <Button onClick={onRefresh} className={isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : ''}>Refresh</Button>
          <Button variant="secondary" onClick={onExport} className={isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : ''}>Export</Button>
        </div>
      </div>

      {/* Organized filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Campaign */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="secondary" className={isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : ''}>Campaigns</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className={`z-[200] rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} p-2 shadow-xl w-64`} sideOffset={8}>
              <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} pb-2`}>
                <input
                  value={campaignQuery}
                  onChange={(e) => setCampaignQuery(e.target.value)}
                  placeholder="Search campaigns..."
                  className={`w-full h-9 px-3 rounded-md border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-200' : 'border-gray-200 bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm`}
                />
              </div>
              <div className="max-h-40 overflow-auto pr-1">
                {filteredCampaigns.map(c => (
                  <DropdownMenu.CheckboxItem key={c} checked={(filters.campaigns||[]).includes(c)} onCheckedChange={() => toggleArray('campaigns', c)} className={`px-3 py-2 rounded-md text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}>
                    {c}
                  </DropdownMenu.CheckboxItem>
                ))}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="secondary" className={isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : ''}>Type</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className={`z-[200] rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} p-2 shadow-xl w-56`} sideOffset={8}>
              {['Email','SMS','WhatsApp','Push'].map(t => (
                <DropdownMenu.CheckboxItem key={t} checked={(filters.campaignType||[]).includes(t)} onCheckedChange={() => toggleArray('campaignType', t)} className={`px-3 py-2 rounded-md text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {t}
                </DropdownMenu.CheckboxItem>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="secondary" className={isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : ''}>Status</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className={`z-[200] rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} p-2 shadow-xl w-56`} sideOffset={8}>
              {['Draft','Scheduled','Live','Completed'].map(s => (
                <DropdownMenu.CheckboxItem key={s} checked={(filters.campaignStatus||[]).includes(s)} onCheckedChange={() => toggleArray('campaignStatus', s)} className={`px-3 py-2 rounded-md text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {s}
                </DropdownMenu.CheckboxItem>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Segments */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="secondary" className={isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : ''}>Segments</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className={`z-[200] rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} p-2 shadow-xl w-64`} sideOffset={8}>
              <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} pb-2`}>
                <input
                  value={segmentQuery}
                  onChange={(e) => setSegmentQuery(e.target.value)}
                  placeholder="Search segments..."
                  className={`w-full h-9 px-3 rounded-md border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-200' : 'border-gray-200 bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm`}
                />
              </div>
              <div className="max-h-40 overflow-auto pr-1">
                {filteredSegments.map(sg => (
                  <DropdownMenu.CheckboxItem key={sg} checked={(filters.segments||[]).includes(sg)} onCheckedChange={() => toggleArray('segments', sg)} className={`px-3 py-2 rounded-md text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}>
                    {sg}
                  </DropdownMenu.CheckboxItem>
                ))}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="secondary" className={isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : ''}>Region</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className={`z-[200] rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} p-2 shadow-xl w-56`} sideOffset={8}>
              {['NA','EU','APAC'].map(r => (
                <DropdownMenu.CheckboxItem key={r} checked={(filters.region||[]).includes(r)} onCheckedChange={() => toggleArray('region', r)} className={`px-3 py-2 rounded-md text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {r}
                </DropdownMenu.CheckboxItem>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="secondary" className={isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : ''}>Device</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className={`z-[200] rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} p-2 shadow-xl w-56`} sideOffset={8}>
              {['Mobile','Desktop','Tablet'].map(d => (
                <DropdownMenu.CheckboxItem key={d} checked={(filters.deviceType||[]).includes(d)} onCheckedChange={() => toggleArray('deviceType', d)} className={`px-3 py-2 rounded-md text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {d}
                </DropdownMenu.CheckboxItem>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Performance */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="secondary" className={isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : ''}>Delivery Status</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className={`z-[200] rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} p-2 shadow-xl w-56`} sideOffset={8}>
              {['Delivered','Bounced','Failed'].map(s => (
                <DropdownMenu.CheckboxItem key={s} checked={(filters.deliveryStatus||[]).includes(s)} onCheckedChange={() => toggleArray('deliveryStatus', s)} className={`px-3 py-2 rounded-md text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {s}
                </DropdownMenu.CheckboxItem>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="secondary" className={isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : ''}>Engagement</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className={`z-[200] rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} p-2 shadow-xl w-56`} sideOffset={8}>
              {['High','Medium','Low'].map(s => (
                <DropdownMenu.CheckboxItem key={s} checked={(filters.engagementLevel||[]).includes(s)} onCheckedChange={() => toggleArray('engagementLevel', s)} className={`px-3 py-2 rounded-md text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {s}
                </DropdownMenu.CheckboxItem>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="secondary" className={isDarkMode ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700' : ''}>Conversion</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className={`z-[200] rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} p-2 shadow-xl w-56`} sideOffset={8}>
              {['Converted','Not Converted'].map(s => (
                <DropdownMenu.CheckboxItem key={s} checked={(filters.conversionStatus||[]).includes(s)} onCheckedChange={() => toggleArray('conversionStatus', s)} className={`px-3 py-2 rounded-md text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {s}
                </DropdownMenu.CheckboxItem>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((c, i) => (
            <span key={i} className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-300' : 'border-gray-200 bg-white/80 text-gray-700'}`}>
              {c.key}: {c.value}
              <button className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => removeChip(c)}>×</button>
            </span>
          ))}
          <button className={`text-xs px-3 py-1 rounded-lg border ${isDarkMode ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`} onClick={() => onChange({})}>Clear all</button>
        </div>
      )}
    </div>
  )
}