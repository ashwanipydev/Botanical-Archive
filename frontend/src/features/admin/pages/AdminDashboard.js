import React, { useState, useEffect } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        todayBookings: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        occupancyRate: 0,
        activeSlots: 0,
        totalUsers: 0,
        totalStaff: 0
    });
    const [bookings, setBookings] = useState([]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const { hasRole } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                let allBookings = [];
                let allSlots = [];
                let summaryData = { totalUsers: 0, totalStaff: 0 };

                // 1. Fetch Summary (Total Users/Staff)
                try {
                    const sumRes = await api.get('/admin/summary');
                    summaryData = sumRes.data;
                } catch (e) { console.error("Summary fetch failed", e); }
                
                // 2. Fetch Bookings (Only if authorized)
                if (hasRole('ROLE_ADMIN') || hasRole('ROLE_BOOKINGS')) {
                    try {
                        const bookingsRes = await api.get('/bookings/all');
                        allBookings = bookingsRes.data;
                    } catch (e) { console.error("Bookings fetch failed", e); }
                }
                
                // 3. Fetch Slots (Only if authorized)
                if (hasRole('ROLE_ADMIN') || hasRole('ROLE_SLOTS')) {
                    try {
                        const slotsRes = await api.get('/slots/');
                        allSlots = slotsRes.data;
                    } catch (e) { console.error("Slots fetch failed", e); }
                }

                // Calculate Stats
                const todayBookingsArr = allBookings.filter(b => b.createdAt && b.createdAt.startsWith(today));
                const totalRev = allBookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
                
                const activeCount = allSlots.filter(s => s.isActive).length;
                
                const todaySlots = allSlots.filter(s => s.slotDate === today);
                let totalCap = 0;
                let usedCap = 0;
                todaySlots.forEach(s => {
                    totalCap += s.totalCapacity;
                    usedCap += (s.totalCapacity - s.availableCapacity);
                });
                const occupancy = totalCap > 0 ? Math.round((usedCap / totalCap) * 100) : 0;

                setStats({
                    todayBookings: summaryData.todayBookings || todayBookingsArr.length,
                    totalRevenue: summaryData.totalRevenue || totalRev,
                    todayRevenue: summaryData.todayRevenue || totalRev,
                    occupancyRate: summaryData.occupancyRate || occupancy,
                    activeSlots: summaryData.activeSlots || activeCount,
                    totalUsers: summaryData.totalUsers || 0,
                    totalStaff: summaryData.totalStaff || 0
                });

                const sortedBookings = [...allBookings].sort((a,b) => b.id - a.id).slice(0, 5);
                setBookings(sortedBookings);
                setSlots(todaySlots);
                
            } catch (error) {
                console.error("Critical error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [hasRole]);

    // Revenue data for the chart (Mocked for now since we don't have a trend API, but using real total)
    const revenueTrend = [
        { day: 'Mon', revenue: 18500 }, { day: 'Tue', revenue: 22300 },
        { day: 'Wed', revenue: 19800 }, { day: 'Thu', revenue: 28400 },
        { day: 'Fri', revenue: 35200 }, { day: 'Sat', revenue: 42100 },
        { day: 'Sun', revenue: stats.totalRevenue > 200000 ? 55000 : stats.totalRevenue / 7 },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="font-headline w-full animate-in fade-in duration-1000 pb-20 md:pb-0">
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="md:hidden flex justify-between items-center mb-8">
                <div>
                    <p className="label">Daily Audit</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-3xl font-black text-primary tracking-tighter">Status</h2>
                        <div className="h-2.5 w-2.5 rounded-full bg-secondary shadow-organic-sm"></div>
                    </div>
                </div>
                <button className="w-12 h-12 flex items-center justify-center rounded-tactile bg-surface-container-high text-primary shadow-organic-sm">
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                </button>
            </div>

            {/* Desktop Hero Header (Hidden on Mobile) */}
            <div className="hidden md:flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-primary tracking-tighter leading-none">Registry<br/>Control</h1>
                    <p className="label mt-6">Scientific Oversight • Botanical Archive System</p>
                </div>
                <button className="btn btn--primary btn--lg shadow-organic-xl flex items-center gap-3">
                    <span className="material-symbols-outlined">add</span>
                    New Entry
                </button>
            </div>

            {/* Bento Grid Metrics - High Fidelity Organic Design */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
                {/* Metric 1: Total Revenue (Main Specimen) */}
                <div className="col-span-2 p-5 md:p-8 rounded-tactile bg-surface-container-lowest shadow-organic-lg flex flex-col justify-between min-h-[160px] md:min-h-[200px] relative overflow-hidden group border-0">
                    <div className="relative z-10">
                        <p className="label mb-4">Aggregate Endowment</p>
                        <h3 className="text-2xl sm:text-3xl md:text-5xl font-black text-primary tracking-tighter">₹{(stats.totalRevenue || 0).toLocaleString()}</h3>
                    </div>
                    <div className="relative z-10 flex items-center gap-4 mt-6">
                        <span className="flex items-center text-[10px] font-black text-secondary px-4 py-2 bg-secondary-container/20 rounded-full uppercase tracking-widest">
                            <span className="material-symbols-outlined text-sm mr-2">trending_up</span>
                            +5.4%
                        </span>
                        <span className="label opacity-40">Archive Growth</span>
                    </div>
                    {/* Organic Geometry */}
                    <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-primary-container/5 rounded-full blur-[60px] group-hover:scale-125 transition-transform duration-1000"></div>
                </div>

                {/* Metric 2: Today's Bookings */}
                <div className="p-5 md:p-8 rounded-tactile bg-surface-container-low flex flex-col justify-between aspect-square border-0 shadow-organic-sm">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-organic-sm">
                        <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
                    </div>
                    <div>
                        <p className="label mb-2">Daily Intake</p>
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-black text-primary">{stats.todayBookings}</span>
                            <span className="text-[10px] text-secondary font-black tracking-widest">+12%</span>
                        </div>
                    </div>
                </div>

                {/* Metric 3: Occupancy */}
                <div className="p-5 md:p-8 rounded-tactile bg-surface-container-low flex flex-col justify-between aspect-square border-0 shadow-organic-sm">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-organic-sm">
                        <span className="material-symbols-outlined text-[24px]">data_usage</span>
                    </div>
                    <div>
                        <p className="label mb-2">Live Density</p>
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-black text-primary">{stats.occupancyRate}%</span>
                            <span className="text-[10px] text-tertiary font-black tracking-widest">-2.1%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bento Layout Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                
                {/* Revenue Trend Chart */}
                <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-5 md:p-10 rounded-tactile shadow-organic-lg">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h4 className="text-2xl font-black text-primary tracking-tighter">Revenue Timeline</h4>
                            <p className="label">Financial Monitoring Protocol</p>
                        </div>
                        <select className="input-field py-2 pr-10 text-[10px] font-black uppercase tracking-widest bg-surface-container-low">
                            <option>Last 7 Cycles</option>
                            <option>Full Audit</option>
                        </select>
                    </div>
                    
                    <div className="h-56 md:h-80 w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(23,57,1,0.05)" />
                            <XAxis 
                                dataKey="day" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 800, fill: 'var(--primary)', opacity: 0.4, letterSpacing: '0.15em' }} 
                                dy={15} 
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 600, fill: 'var(--primary)', opacity: 0.4 }} 
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '24px', border: 'none', background: 'var(--surface-container-lowest)', boxShadow: 'var(--shadow-xl)' }}
                                itemStyle={{ color: 'var(--primary)', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#primaryGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Upcoming Slots Side-Bento */}
                <div className="col-span-12 lg:col-span-4 bg-primary text-background p-6 md:p-10 rounded-tactile shadow-organic-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h4 className="text-2xl font-black tracking-tight mb-3">Imminent Access</h4>
                        <p className="label text-background/60 mb-10">Live Registry Thresholds</p>
                        <div className="space-y-8">
                            {slots.length > 0 ? slots.map(s => {
                                const occupancy = Math.round(((s.totalCapacity - s.availableCapacity) / s.totalCapacity) * 100);
                                return (
                                    <div key={s.id} className="space-y-4">
                                        <div className="flex justify-between label text-background/80">
                                            <span>{s.startTime.substring(0,5)} • Access Window</span>
                                            <span>{occupancy}% Volume</span>
                                        </div>
                                        <div className="w-full bg-background/10 h-2.5 rounded-full overflow-hidden">
                                            <div className="bg-secondary-container h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${occupancy}%` }}></div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 py-16 text-center border-2 border-dashed border-background/20 rounded-tactile">Archive Empty for this Cycle</p>
                            )}
                        </div>
                        
                        <div className="mt-14 p-6 bg-background/5 rounded-tactile border-0 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-secondary-container">biotech</span>
                                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed text-background/70">Predictive analysis suggests heightened registry activity for the 'Sunset Habitat' window.</p>
                            </div>
                        </div>
                    </div>
                    {/* Artistic geometry */}
                    <div className="absolute -right-24 -bottom-24 w-72 h-72 border-[48px] border-background/5 rounded-full"></div>
                </div>

                {/* Recent Activity Logs */}
                <div className="col-span-12 space-y-8">
                    <div className="flex justify-between items-center px-4">
                        <h4 className="text-3xl font-black text-primary tracking-tighter">Recent Logistics</h4>
                        <button className="label border-b-2 border-primary/10 pb-1 hover:border-primary transition-all">Archival History</button>
                    </div>

                    {/* Desktop View Table: No-Line Rule Compliance */}
                    <div className="hidden md:block bg-surface-container-lowest rounded-tactile shadow-organic-lg overflow-hidden border-0">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-surface-container-low label text-primary/40">
                                    <th className="px-10 py-8">Reference</th>
                                    <th className="px-10 py-8">Steward</th>
                                    <th className="px-10 py-8">Temporal</th>
                                    <th className="px-10 py-8">Units</th>
                                    <th className="px-10 py-8">Endowment</th>
                                    <th className="px-10 py-8">Status</th>
                                    <th className="px-10 py-8"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-0">
                                {bookings.map((b) => (
                                    <tr key={b.id} className="hover:bg-surface-container-low/50 transition-all group">
                                        <td className="px-10 py-8 text-[11px] font-black text-primary/40 tracking-widest">#ARC-{b.id}</td>
                                        <td className="px-10 py-8 text-sm font-black text-primary tracking-tight">{b.user?.fullName || 'Anonymous'}</td>
                                        <td className="px-10 py-8 label">{b.slot?.startTime?.substring(0, 5) || '--:--'}</td>
                                        <td className="px-10 py-8 text-sm font-black text-primary">{b.adultTickets + b.childTickets}</td>
                                        <td className="px-10 py-8 text-sm font-black text-primary">₹{b.totalAmount.toLocaleString()}</td>
                                        <td className="px-10 py-8">
                                            <span className={`px-5 py-2 label rounded-full shadow-sm ${
                                                b.status === 'CONFIRMED' ? 'bg-secondary-container/20 text-secondary' : 
                                                b.status === 'PENDING' ? 'bg-tertiary-container/10 text-tertiary' : 'bg-error-container/20 text-error'
                                            }`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button className="material-symbols-outlined text-primary/20 hover:text-primary transition-all group-hover:opacity-100 opacity-0">api</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View Cards */}
                    <div className="md:hidden space-y-6">
                        {bookings.map((b) => (
                            <div key={b.id} className="p-8 bg-surface-container-lowest rounded-tactile shadow-organic-md flex items-center justify-between border-0">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-tactile bg-surface-container-low flex items-center justify-center text-primary shadow-sm">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-primary tracking-tight leading-none mb-1">{b.user?.fullName || 'Anonymous'}</p>
                                        <p className="label">#ARC-{b.id} • {b.slot?.startTime?.substring(0, 5)} Audit</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-primary mb-2">₹{b.totalAmount.toLocaleString()}</p>
                                    <span className={`text-[8px] px-3 py-1 label rounded-full ${
                                        b.status === 'CONFIRMED' ? 'bg-secondary-container/20 text-secondary' : 'bg-error-container/10 text-error'
                                    }`}>
                                        {b.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
