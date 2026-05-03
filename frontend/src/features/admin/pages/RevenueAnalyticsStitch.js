import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import {
  AdminPageHeader,
  AdminPanel,
  AdminSectionTitle,
  AdminStatCard,
} from '../components/AdminPrimitives';

const dailyRevenue = [
  { day: 'Apr 10', revenue: 18500 }, { day: 'Apr 11', revenue: 22300 }, { day: 'Apr 12', revenue: 19800 },
  { day: 'Apr 13', revenue: 28400 }, { day: 'Apr 14', revenue: 35200 }, { day: 'Apr 15', revenue: 42100 }, { day: 'Apr 16', revenue: 38500 },
];

const ticketTypes = [
  { name: 'Adults', value: 62, color: '#173901' },
  { name: 'Children', value: 28, color: '#396A1E' },
  { name: 'Add-ons', value: 10, color: '#B9F395' },
];

const bookingsBySlot = [
  { slot: '09:00', bookings: 78 },
  { slot: '11:00', bookings: 42 },
  { slot: '14:00', bookings: 65 },
  { slot: '16:00', bookings: 80 },
];

const topDays = [
  { date: 'Apr 12, 2026', bookings: 198, revenue: 42100, occupancy: '92%' },
  { date: 'Apr 11, 2026', bookings: 176, revenue: 38500, occupancy: '88%' },
  { date: 'Apr 10, 2026', bookings: 156, revenue: 35200, occupancy: '78%' },
  { date: 'Apr 09, 2026', bookings: 134, revenue: 28400, occupancy: '72%' },
];

const RevenueAnalyticsStitch = () => {
  const [range, setRange] = useState('7d');

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Ecofinancial Audit"
        title="Revenue Analytics"
        description="High-level reporting view for revenue, demand distribution, and top-performing booking cycles."
        action={(
          <div className="flex rounded-full bg-surface-container-low p-1.5">
            {['7d', '30d', '90d'].map((value) => (
              <button
                key={value}
                className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] ${range === value ? 'bg-primary text-background' : 'text-on-surface-variant'}`}
                onClick={() => setRange(value)}
              >
                {value}
              </button>
            ))}
          </div>
        )}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard icon="payments" label="Gross revenue" value="₹12,45,000" meta="Period" accent="primary" />
        <AdminStatCard icon="confirmation_number" label="Archived entries" value="1,234" meta="Volume" accent="secondary" />
        <AdminStatCard icon="account_balance_wallet" label="Average booking" value="₹1,009" meta="Yield" accent="tertiary" />
        <AdminStatCard icon="trending_up" label="Growth rate" value="+12.5%" meta="Trend" accent="neutral" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <AdminPanel className="col-span-12">
          <AdminSectionTitle eyebrow="Revenue Succession" title="Daily financial trend" description="Rolling revenue timeline for the selected reporting window." />
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsRevenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(23,57,1,0.08)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--on-surface-variant)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--on-surface-variant)' }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={4} fill="url(#analyticsRevenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AdminPanel>

        <AdminPanel className="col-span-12 lg:col-span-5">
          <AdminSectionTitle eyebrow="Ticket Archetypes" title="Stewardship distribution" />
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ticketTypes} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={4} stroke="none">
                  {ticketTypes.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-3">
            {ticketTypes.map((entry) => (
              <div key={entry.name} className="flex items-center gap-3 rounded-[1.25rem] bg-surface-container-low p-4">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="flex-1 text-sm font-semibold text-on-surface">{entry.name}</span>
                <span className="text-sm font-black text-primary">{entry.value}%</span>
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel className="col-span-12 lg:col-span-7">
          <AdminSectionTitle eyebrow="Temporal Density" title="Bookings by slot" />
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingsBySlot} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(23,57,1,0.08)" />
                <XAxis dataKey="slot" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--on-surface-variant)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--on-surface-variant)' }} />
                <Tooltip />
                <Bar dataKey="bookings" fill="var(--secondary)" radius={[10, 10, 0, 0]} barSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminPanel>
      </div>

      <AdminPanel>
        <AdminSectionTitle eyebrow="Archival Excellence" title="Top performing cycles" description="Best performing days by revenue and occupancy saturation." />
        <div className="space-y-3">
          {topDays.map((day) => (
            <div key={day.date} className="rounded-[1.5rem] bg-surface-container-low p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-lg font-black text-primary">{day.date}</div>
                  <div className="text-sm font-semibold text-on-surface-variant">{day.bookings} bookings</div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-base font-black text-primary">₹{day.revenue.toLocaleString()}</div>
                  <div className="min-w-[160px]">
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                      <span>Occupancy</span>
                      <span>{day.occupancy}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-surface-container-high">
                      <div className="h-full rounded-full bg-secondary" style={{ width: day.occupancy }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AdminPanel>
    </div>
  );
};

export default RevenueAnalyticsStitch;
