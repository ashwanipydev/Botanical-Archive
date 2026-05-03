import React, { useState, useEffect } from 'react';
import { FiSearch, FiDownload, FiEye } from 'react-icons/fi';
import api from '../../services/api';

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get('/bookings/all');
                setBookings(res.data);
            } catch (err) {
                console.error("Error fetching bookings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const filtered = bookings.filter(b => {
        const statusMatch = statusFilter === 'all' || b.status?.toLowerCase() === statusFilter;
        const searchMatch = !search || 
            b.id.toString().includes(search) || 
            b.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            b.user?.email?.toLowerCase().includes(search.toLowerCase());
        return statusMatch && searchMatch;
    });

    const statusCounts = {
        all: bookings.length,
        confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
        pending: bookings.filter(b => b.status === 'PENDING').length,
        failed: bookings.filter(b => ['FAILED', 'EXPIRED'].includes(b.status)).length,
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="animate-spin text-primary"><span className="material-symbols-outlined text-4xl">sync</span></div>
                <p className="text-on-surface-variant font-medium">Synchronizing Botanical Records...</p>
            </div>
        );
    }

    return (
        <div className="font-headline w-full animate-in fade-in duration-700 relative">
            {/* Top Bar / Header */}
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
                <div>
                    <span className="text-on-surface-variant font-label text-sm uppercase tracking-widest mb-2 block">Visitor Operations</span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary tracking-tight leading-none">Booking Management</h2>
                </div>
                <button className="bg-surface-container-high px-4 py-3 rounded-xl text-on-surface font-semibold flex items-center gap-2 hover:opacity-80 transition-opacity active:scale-95 duration-150 shadow-sm border border-outline-variant/10 self-start sm:self-auto">
                    <span className="material-symbols-outlined">download</span>
                    Export CSV
                </button>
            </header>

            {/* Stats Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'All Bookings', value: statusCounts.all, key: 'all', theme: 'primary' },
                    { label: 'Confirmed', value: statusCounts.confirmed, key: 'confirmed', theme: 'secondary' },
                    { label: 'Pending', value: statusCounts.pending, key: 'pending', theme: 'tertiary' },
                    { label: 'Failed/Expired', value: statusCounts.failed, key: 'failed', theme: 'error' },
                ].map(s => (
                    <div 
                        key={s.key}
                        onClick={() => setStatusFilter(s.key)}
                        className={`bg-surface-container-lowest p-6 rounded-xl flex flex-col gap-1 transition-all cursor-pointer border-b-4 ${statusFilter === s.key ? `border-${s.theme} bg-surface-container-low` : 'border-transparent hover:border-outline-variant/30'}`}
                    >
                        <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest font-bold">{s.label}</span>
                        <span className={`text-3xl font-black text-${s.theme}`}>{s.value}</span>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="bg-surface-container-low p-4 rounded-xl flex flex-wrap items-center gap-4 mb-8">
                <div className="flex-1 min-w-[240px] relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                    <input 
                        className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border-none rounded-lg focus:ring-2 focus:ring-primary text-sm font-body shadow-inner" 
                        placeholder="Search by ID or Name..." 
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <select 
                        className="bg-surface-container-lowest border-none rounded-lg py-3 pl-3 pr-8 text-sm font-label focus:ring-2 focus:ring-primary shadow-inner"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Status: All</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed/Expired</option>
                    </select>
                    <input className="bg-surface-container-lowest border-none rounded-lg py-3 px-3 text-sm font-label focus:ring-2 focus:ring-primary shadow-inner" type="date"/>
                </div>
            </div>

            {/* Registry (Desktop Table / Mobile Cards) */}
            <div className="space-y-6">
                {/* Desktop View Table */}
                <div className="hidden md:block bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low text-on-surface-variant font-label text-[10px] uppercase tracking-widest font-bold">
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Visitor</th>
                                <th className="px-6 py-4">Date & Slot</th>
                                <th className="px-6 py-4">Tickets</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container-low">
                            {filtered.map(b => (
                                <tr 
                                    key={b.id} 
                                    onClick={() => setSelectedBooking(b)}
                                    className={`hover:bg-surface-container-low transition-colors cursor-pointer group ${selectedBooking?.id === b.id ? 'bg-surface-container-low' : ''}`}
                                >
                                    <td className="px-6 py-5 font-bold text-primary text-sm">#ZOO-{b.id.toString().padStart(5, '0')}</td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-on-surface text-sm">{b.user?.fullName || 'Guest Visitor'}</span>
                                            <span className="text-[10px] text-on-surface-variant uppercase tracking-tight">{b.user?.email || 'No Email Record'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{b.slot?.slotDate || 'N/A'}</span>
                                            <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">{b.slot?.startTime?.substring(0, 5) || 'ASAP'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold">{b.adultTickets}A + {b.childTickets}C</span>
                                            <div className="flex gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                {b.addOnSafari > 0 && <span className="material-symbols-outlined text-xs">directions_car</span>}
                                                {b.addOnCamera > 0 && <span className="material-symbols-outlined text-xs">photo_camera</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-black text-on-surface">₹{b.totalAmount.toLocaleString()}</td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full tracking-tighter ${
                                            b.status === 'CONFIRMED' ? 'bg-secondary-container/30 text-on-secondary-container' : 
                                            b.status === 'PENDING' ? 'bg-surface-container-high text-on-surface-variant' : 'bg-error-container/20 text-error'
                                        }`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 hover:bg-surface-container-low rounded-full transition-all">
                                            <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View Cards */}
                <div className="md:hidden space-y-4">
                    {filtered.map(b => (
                        <div 
                            key={b.id} 
                            onClick={() => setSelectedBooking(b)}
                            className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm space-y-6 active:scale-[0.98] transition-transform"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-black text-primary text-sm uppercase tracking-widest leading-none mb-1">#ZOO-{b.id.toString().padStart(5, '0')}</h3>
                                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">{b.slot?.slotDate} • {b.slot?.startTime?.substring(0, 5)}</p>
                                </div>
                                <span className={`px-3 py-1 text-[8px] font-black uppercase rounded-lg tracking-widest ${
                                    b.status === 'CONFIRMED' ? 'bg-secondary-container/30 text-secondary' : 
                                    b.status === 'PENDING' ? 'bg-surface-container-high text-on-surface-variant' : 'bg-error-container/20 text-error'
                                }`}>
                                    {b.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 py-2 border-y border-outline-variant/5">
                                <div className="w-10 h-10 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary font-black text-xs">
                                    {b.user?.fullName ? b.user.fullName.charAt(0) : 'G'}
                                </div>
                                <div>
                                    <p className="font-bold text-on-surface text-sm leading-tight">{b.user?.fullName || 'Guest Visitor'}</p>
                                    <p className="text-[9px] text-on-surface-variant font-medium truncate max-w-[180px]">{b.user?.email || 'Archive mission email'}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-on-surface-variant">
                                        <span className="material-symbols-outlined text-sm">person</span>
                                        <span className="text-[10px] font-black">{b.adultTickets}A</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-on-surface-variant">
                                        <span className="material-symbols-outlined text-sm">child_care</span>
                                        <span className="text-[10px] font-black">{b.childTickets}C</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-0.5">Transaction</p>
                                    <p className="font-black text-on-surface text-base">₹{b.totalAmount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
                <p className="text-[10px] text-on-surface-variant font-label font-bold uppercase tracking-widest">Showing {filtered.length} of {bookings.length} Archives</p>
                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md">1</button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-low font-bold text-xs transition-all">2</button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-low font-bold text-xs transition-all">3</button>
                </div>
            </div>

            {/* Side Drawer (Right Panel) */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[9999] !m-0 !top-0 flex justify-end animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-md" onClick={() => setSelectedBooking(null)}></div>
                    <aside className="relative w-full max-w-[450px] h-full bg-surface-container-lowest shadow-2xl flex flex-col border-l border-outline-variant/10 animate-in slide-in-from-right duration-500">
                        <div className="p-8 overflow-y-auto hide-scrollbar">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-headline font-bold text-xl text-primary">Booking Archive</h3>
                                <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {/* Detail Header */}
                            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-8 bg-surface-container-low group">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <span className="material-symbols-outlined text-white text-4xl">qr_code_2</span>
                                </div>
                                <div className="absolute bottom-4 left-4 z-20 text-white">
                                    <p className="text-[10px] uppercase font-label tracking-widest opacity-80 font-bold font-white">Reference ID</p>
                                    <h4 className="font-bold text-2xl">#ZOO-{selectedBooking.id.toString().padStart(5, '0')}</h4>
                                </div>
                            </div>

                            {/* Visitor Card */}
                            <div className="space-y-6">
                                <section>
                                    <p className="text-[10px] uppercase font-label tracking-widest text-on-surface-variant mb-3 font-bold">Steward Details</p>
                                    <div className="bg-surface-container-low p-5 rounded-2xl flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-container text-on-primary rounded-xl flex items-center justify-center font-black text-lg">
                                            {selectedBooking.user?.fullName ? selectedBooking.user.fullName.split(' ').map(n => n[0]).join('') : 'G'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-on-surface">{selectedBooking.user?.fullName || 'Guest Visitor'}</p>
                                            <p className="text-xs text-on-surface-variant font-medium">{selectedBooking.user?.email || 'Archive missing email'}</p>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <p className="text-[10px] uppercase font-label tracking-widest text-on-surface-variant mb-3 font-bold">Ledger Breakdown</p>
                                    <div className="space-y-4 bg-surface-container-low/30 p-6 rounded-2xl border border-outline-variant/10">
                                        <div className="flex justify-between items-center text-sm font-medium">
                                            <span className="text-on-surface-variant">Adult Entry (x{selectedBooking.adultTickets})</span>
                                            <span className="font-bold text-on-surface">₹{(selectedBooking.adultTickets * 100).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-medium">
                                            <span className="text-on-surface-variant">Child Entry (x{selectedBooking.childTickets})</span>
                                            <span className="font-bold text-on-surface">₹{(selectedBooking.childTickets * 50).toLocaleString()}</span>
                                        </div>
                                        {selectedBooking.addOnSafari > 0 && (
                                            <div className="flex justify-between items-center text-sm font-medium">
                                                <span className="text-on-surface-variant uppercase text-[10px] font-bold tracking-tighter">Wilderness Safari</span>
                                                <span className="font-bold text-secondary">₹{selectedBooking.addOnSafari.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                                            <span className="font-bold uppercase text-xs tracking-widest">Total Transaction</span>
                                            <span className="font-black text-2xl text-primary font-headline">₹{selectedBooking.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <p className="text-[10px] uppercase font-label tracking-widest text-on-surface-variant mb-3 font-bold">Audit Timeline</p>
                                    <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant/30">
                                        <div className="relative">
                                            <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-secondary ring-4 ring-white animate-pulse"></div>
                                            <p className="text-sm font-bold">Ledger status: {selectedBooking.status}</p>
                                            <p className="text-[10px] text-on-surface-variant font-medium">Recorded at system midnight</p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-12 flex flex-col gap-3">
                                <button className="w-full py-4 bg-primary text-on-primary font-bold rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">Resend Reservation</button>
                                <button className="w-full py-4 border border-outline-variant text-on-surface font-bold rounded-xl text-sm hover:bg-surface-container-low transition-colors">Void Transaction</button>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default BookingManagement;
