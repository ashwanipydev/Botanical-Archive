import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const dailyRevenue = [
  { day: 'Apr 10', revenue: 18500 }, { day: 'Apr 11', revenue: 22300 },
  { day: 'Apr 12', revenue: 19800 }, { day: 'Apr 13', revenue: 28400 },
  { day: 'Apr 14', revenue: 35200 }, { day: 'Apr 15', revenue: 42100 },
  { day: 'Apr 16', revenue: 38500 },
];

const ticketTypes = [
  { name: 'Adults', value: 62, color: '#3a5947' }, /* using our primary-dim mapping */
  { name: 'Children', value: 28, color: '#98c27b' },
  { name: 'Add-ons', value: 10, color: '#e7f0c4' }, /* tertiary-container mapping */
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

const RevenueAnalytics = () => {
    const [range, setRange] = useState('7d');

    return (
        <div className="font-headline w-full animate-in fade-in duration-700">
            {/* Header / Global Controls */}
            <header className="flex justify-between items-end mb-12">
                <div>
                    <span className="text-on-surface-variant font-label text-sm uppercase tracking-widest mb-2 block">Ecofinancial Audit</span>
                    <h2 className="text-4xl font-extrabold text-primary tracking-tight leading-none">Revenue Analytics</h2>
                </div>
                <div className="flex gap-1 bg-surface-container-high p-1.5 rounded-xl border border-outline-variant/10 shadow-sm">
                    {[{ k: '7d', l: '7D' }, { k: '30d', l: '30D' }, { k: '90d', l: '90D' }].map(r => (
                        <button 
                            key={r.k} 
                            onClick={() => setRange(r.k)}
                            className={`px-5 py-2 rounded-lg font-bold text-xs transition-all duration-300 ${range === r.k ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
                        >
                            {r.l}
                        </button>
                    ))}
                </div>
            </header>

            {/* KPI Stats Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Gross Revenue', value: '₹12,45,000', trend: '+18.2%', icon: 'payments', theme: 'primary' },
                    { label: 'Archived Entries', value: '1,234', trend: '+12.5%', icon: 'confirmation_number', theme: 'secondary' },
                    { label: 'Stewardship Avg', value: '₹1,009', trend: '+5.3%', icon: 'account_balance_wallet', theme: 'tertiary' },
                    { label: 'Succession Rate', value: '+12.5%', trend: '+2.1%', icon: 'trending_up', theme: 'primary' },
                ].map((s, i) => (
                    <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm group hover:scale-[1.02] transition-transform" key={i}>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-xl bg-surface-container-low text-${s.theme}`}>
                                <span className="material-symbols-outlined text-2xl">{s.icon}</span>
                            </div>
                            <span className="text-on-secondary-container bg-secondary-container/40 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight">{s.trend}</span>
                        </div>
                        <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</p>
                        <h3 className="text-3xl font-black text-on-surface tracking-tight">{s.value}</h3>
                    </div>
                ))}
            </div>

            {/* Main Data Layer: Trend Chart */}
            <div className="grid grid-cols-12 gap-8 mb-8">
                <div className="col-span-12 bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant/10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <span className="material-symbols-outlined text-[120px]">show_chart</span>
                    </div>
                    <div className="mb-10 relative z-10">
                        <h4 className="text-xl font-bold text-primary tracking-tight">Revenue Succession Trend</h4>
                        <p className="text-on-surface-variant text-sm font-medium">Daily financial accumulation across the botanical estate.</p>
                    </div>
                    <div className="h-[250px] md:h-[350px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--md-sys-color-primary)" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="var(--md-sys-color-primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: 'var(--md-sys-color-on-surface-variant)' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: 'var(--md-sys-color-on-surface-variant)' }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', background: 'var(--md-sys-color-surface-container-highest)', padding: '12px 20px' }}
                                    itemStyle={{ color: 'var(--md-sys-color-primary)', fontWeight: 900, fontSize: '14px' }}
                                    labelStyle={{ color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 700, marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="var(--md-sys-color-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" dot={{ r: 6, fill: 'var(--md-sys-color-primary)', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribution & Slots */}
                <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant/10 shadow-sm">
                    <div className="mb-8">
                        <h4 className="text-lg font-bold text-on-surface tracking-tight leading-none">Ticket Archetypes</h4>
                        <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-1">Stewardship Distribution</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-full h-[220px] md:h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={ticketTypes} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value" stroke="none" paddingAngle={4}>
                                        {ticketTypes.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full grid grid-cols-2 gap-3 mt-6">
                            {ticketTypes.map(t => (
                                <div key={t.name} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low/50 border border-outline-variant/10">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-tighter text-on-surface line-clamp-1">{t.name}</span>
                                        <span className="text-xs font-black text-primary">{t.value}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant/10 shadow-sm">
                    <div className="mb-8">
                        <h4 className="text-lg font-bold text-on-surface tracking-tight leading-none">Temporal Density</h4>
                        <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-1">Bookings by Archival Time Slot</p>
                    </div>
                    <div className="h-[250px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bookingsBySlot} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis dataKey="slot" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: 'var(--md-sys-color-on-surface-variant)' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: 'var(--md-sys-color-on-surface-variant)' }} />
                                <Tooltip cursor={{fill: 'var(--md-sys-color-surface-container-low)'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                                <Bar dataKey="bookings" fill="var(--md-sys-color-secondary)" radius={[8, 8, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Performance Ledger: Top Days (Desktop Table / Mobile Cards) */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden mb-12">
                <div className="p-8 border-b border-surface-container-low flex justify-between items-center">
                    <div>
                        <h4 className="text-xl font-bold text-primary tracking-tight leading-none">Archival Excellence</h4>
                        <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-1">Top Performing Biological cycles</p>
                    </div>
                    <button className="text-primary font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity">
                        View Audit Log
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-surface-container-low/30 text-[10px] font-black text-on-surface-variant uppercase tracking-widest font-label">
                                <th className="px-10 py-5">Temporal Index</th>
                                <th className="px-10 py-5">Entry Volume</th>
                                <th className="px-10 py-5">Financial Yield</th>
                                <th className="px-10 py-5 text-right">Occupancy Saturation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container-low">
                            {topDays.map(d => (
                                <tr key={d.date} className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                                    <td className="px-10 py-6 text-sm font-bold text-on-surface">{d.date}</td>
                                    <td className="px-10 py-6 text-sm font-medium text-on-surface-variant">{d.bookings} Specimens</td>
                                    <td className="px-10 py-6 text-sm font-black text-primary">₹{d.revenue.toLocaleString()}</td>
                                    <td className="px-10 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <div className="w-24 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                                                <div className="h-full bg-secondary" style={{ width: d.occupancy }}></div>
                                            </div>
                                            <span className="text-[10px] font-black text-secondary uppercase tracking-tighter w-10">{d.occupancy}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-surface-container-low/50">
                    {topDays.map(d => (
                        <div key={d.date} className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-black text-on-surface">{d.date}</p>
                                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{d.bookings} Entries</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-primary">₹{d.revenue.toLocaleString()}</p>
                                    <p className="text-[9px] text-secondary font-black uppercase tracking-tighter">{d.occupancy} Saturation</p>
                                </div>
                            </div>
                            <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                                <div className="h-full bg-secondary" style={{ width: d.occupancy }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RevenueAnalytics;
