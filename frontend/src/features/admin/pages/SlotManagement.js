import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiPower, FiX } from 'react-icons/fi';
import api from '../../services/api';

const SlotManagement = () => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Form state
    const [formData, setFormData] = useState({
        slotDate: selectedDate,
        startTime: '',
        endTime: '',
        totalCapacity: 100,
        isActive: true
    });

    useEffect(() => {
        fetchSlots();
    }, [selectedDate]);

    const fetchSlots = async () => {
        try {
            setLoading(true);
            // Use the available slots endpoint for now, or the admin all slots endpoint
            const res = await api.get('/slots/');
            const allSlots = res.data;
            const dateFiltered = allSlots.filter(s => {
                const sDate = typeof s.slotDate === 'string' ? s.slotDate : 
                             Array.isArray(s.slotDate) ? `${s.slotDate[0]}-${String(s.slotDate[1]).padStart(2,'0')}-${String(s.slotDate[2]).padStart(2,'0')}` : 
                             '';
                return sDate === selectedDate;
            });
            setSlots(dateFiltered);
        } catch (err) {
            console.error("Error fetching slots:", err);
            // Fallback: set empty array if error
            setSlots([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSlot = async (e) => {
        e.preventDefault();
        try {
            await api.post('/slots/', {
                ...formData,
                availableCapacity: formData.totalCapacity
            });
            setShowModal(false);
            fetchSlots();
        } catch (err) {
            console.error("Error creating slot:", err);
            alert("Failed to create slot. Check console for details.");
        }
    };

    const toggleSlotStatus = async (id, currentStatus) => {
        try {
            const slot = slots.find(s => s.id === id);
            await api.put(`/slots/${id}`, { ...slot, isActive: !currentStatus });
            fetchSlots();
        } catch (err) {
            console.error("Error toggling slot:", err);
        }
    };

    const filtered = filter === 'all' ? slots : filter === 'active' ? slots.filter(s => s.isActive) : slots.filter(s => !s.isActive);

    return (
        <div className="font-headline w-full animate-in fade-in duration-1000">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
                <div>
                    <p className="label mb-3">Temporal Distribution</p>
                    <h2 className="text-5xl font-black text-primary tracking-tighter leading-none">Slot<br/>Orchestration</h2>
                </div>
                <button 
                    onClick={() => {
                        setFormData({...formData, slotDate: selectedDate});
                        setShowModal(true);
                    }}
                    className="btn btn--primary btn--lg shadow-organic-xl flex items-center gap-3"
                >
                    <span className="material-symbols-outlined text-xl">add_circle</span>
                    Initialize Cycle
                </button>
            </header>

            {/* Filters Section - Tactile Bento Style */}
            <section className="flex flex-wrap gap-8 mb-12 items-center bg-surface-container-low p-8 rounded-tactile shadow-organic-sm border-0">
                <div className="flex flex-col gap-3">
                    <label className="label text-[9px] ml-1 opacity-40">Observational Date</label>
                    <div className="flex items-center bg-surface-container-lowest px-6 py-4 rounded-tactile shadow-inner group">
                        <span className="material-symbols-outlined text-primary/30 mr-3 group-hover:text-primary transition-colors">calendar_clock</span>
                        <input 
                            type="date" 
                            min={new Date().toISOString().split('T')[0]}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent border-0 focus:ring-0 text-sm font-black text-primary p-0" 
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <label className="label text-[9px] ml-1 opacity-40">Registry Status</label>
                    <div className="flex items-center bg-surface-container-lowest px-6 py-4 rounded-tactile shadow-inner group min-w-[200px]">
                        <span className="material-symbols-outlined text-primary/30 mr-3 group-hover:text-primary transition-colors">tune</span>
                        <select 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-transparent border-0 focus:ring-0 text-sm font-black text-primary p-0 w-full appearance-none cursor-pointer"
                        >
                            <option value="all">All Cycles</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Halted Only</option>
                        </select>
                    </div>
                </div>
                <div className="md:ml-auto">
                    <div className="px-6 py-4 bg-secondary-container/20 rounded-tactile shadow-sm flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-background">
                            <span className="material-symbols-outlined text-sm">analytics</span>
                        </div>
                        <span className="label text-[10px] text-secondary">{filtered.length} Configured Nodes</span>
                    </div>
                </div>
            </section>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="animate-spin text-primary">
                        <span className="material-symbols-outlined text-5xl">laundry</span>
                    </div>
                    <p className="label animate-pulse">Synchronizing Temporal Nodes...</p>
                </div>
            ) : (
                <>
                    {/* Visual Node Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                        {filtered.length > 0 ? filtered.map(slot => {
                            const pct = Math.round(((slot.totalCapacity - slot.availableCapacity) / slot.totalCapacity) * 100);
                            return (
                                <div key={slot.id} className={`bg-surface-container-lowest p-8 rounded-tactile shadow-organic-md hover:shadow-organic-lg transition-all border-0 transform hover:-translate-y-2 group`}>
                                    <div className="flex justify-between items-center mb-6">
                                        <div className={`w-12 h-12 rounded-tactile flex items-center justify-center shadow-organic-sm ${slot.isActive ? 'bg-primary/5 text-primary' : 'bg-error-container/10 text-error'}`}>
                                            <span className="material-symbols-outlined text-xl">
                                                {slot.isActive ? 'nest_clock_farsight_analog' : 'timer_off'}
                                            </span>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full label text-[8px] shadow-sm ${slot.isActive ? 'bg-secondary-container/20 text-secondary' : 'bg-error-container/20 text-error'}`}>
                                            {slot.isActive ? 'OPERATIONAL' : 'HALTED'}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1 mb-8">
                                        <p className="font-black text-primary text-xl tracking-tighter leading-none">{slot.startTime.substring(0, 5)} — {slot.endTime.substring(0, 5)}</p>
                                        <p className="label text-[9px] opacity-40 uppercase">Archival Rotation Node</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-0.5">
                                                <p className="label text-[8px] opacity-40">Occupancy Density</p>
                                                <p className="font-black text-primary text-xs">{slot.totalCapacity - slot.availableCapacity} / {slot.totalCapacity}</p>
                                            </div>
                                            <span className={`label text-[10px] font-black ${pct > 80 ? 'text-error' : 'text-secondary'}`}>{pct}%</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden shadow-inner p-0.5">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${slot.isActive ? (pct > 80 ? 'bg-error' : 'bg-secondary') : 'bg-primary/20'}`} 
                                                style={{ width: `${pct}%` }} 
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-10">
                                        <button className="flex-1 label text-[9px] py-3 rounded-tactile bg-surface-container-low text-primary/40 hover:text-primary hover:bg-surface-container-high transition-all shadow-organic-sm">
                                            Edit Node
                                        </button>
                                        <button 
                                            onClick={() => toggleSlotStatus(slot.id, slot.isActive)}
                                            className={`flex-1 label text-[9px] py-3 rounded-tactile transition-all shadow-organic-sm ${slot.isActive ? 'bg-error-container/10 text-error hover:bg-error-container/20' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
                                        >
                                            {slot.isActive ? 'Deactivate' : 'Restore'}
                                        </button>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="col-span-full py-24 bg-surface-container-low rounded-tactile border-0 flex flex-col items-center justify-center text-center shadow-inner">
                                <div className="w-20 h-20 rounded-tactile bg-surface-container-lowest flex items-center justify-center text-primary/10 mb-6 shadow-organic-md">
                                    <span className="material-symbols-outlined text-5xl">event_busy</span>
                                </div>
                                <h3 className="text-xl font-black text-primary tracking-tight">No Active Temporal Nodes</h3>
                                <p className="label text-[10px] mt-2 opacity-40">Initialize the botanical rotation sequence for this date.</p>
                            </div>
                        )}
                    </div>

                    {/* Detailed Registry - Tactical Sheet Style */}
                    <section className="space-y-8">
                        <div className="bg-surface-container-lowest rounded-tactile shadow-organic-lg overflow-hidden border-0">
                            <div className="px-10 py-10 bg-surface-container-low flex justify-between items-center">
                                <div>
                                    <p className="label mb-1">Archive Index</p>
                                    <h3 className="text-3xl font-black text-primary tracking-tighter leading-none">Slot Registry Details</h3>
                                </div>
                                <button className="btn bg-surface-container-high text-primary/60 px-6 py-3 rounded-tactile label text-[9px] flex items-center gap-2 hover:text-primary transition-all shadow-organic-sm">
                                    <span className="material-symbols-outlined text-sm">database_export</span>
                                    Registry Export
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-surface-container-low/50 label text-[9px] text-primary/30">
                                            <th className="px-10 py-6">Temporal Window</th>
                                            <th className="px-10 py-6">Registry Capacity</th>
                                            <th className="px-10 py-6">Current Load</th>
                                            <th className="px-10 py-6">Availability</th>
                                            <th className="px-10 py-6">Clearance</th>
                                            <th className="px-10 py-6 text-right">Audit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-0">
                                        {filtered.map((slot) => (
                                            <tr key={slot.id} className="group hover:bg-surface-container-low/50 transition-all">
                                                <td className="px-10 py-8 font-black text-primary text-base tracking-tighter">{slot.startTime.substring(0, 5)} — {slot.endTime.substring(0, 5)}</td>
                                                <td className="px-10 py-8 label text-primary/60 font-black">{slot.totalCapacity}</td>
                                                <td className="px-10 py-8 label text-primary/60 font-black">{slot.totalCapacity - slot.availableCapacity}</td>
                                                <td className="px-10 py-8">
                                                    <span className={`label text-sm font-black ${slot.availableCapacity < 10 ? 'text-error' : 'text-secondary'}`}>{slot.availableCapacity}</span>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full shadow-sm w-fit ${slot.isActive ? 'bg-secondary-container/20 text-secondary' : 'bg-surface-container-high text-primary/40 opacity-40'}`}>
                                                        <div className={`w-2 h-2 rounded-full ${slot.isActive ? 'bg-secondary animate-pulse' : 'bg-primary/20'}`}></div>
                                                        <span className="label text-[8px]">{slot.isActive ? 'ACTIVE' : 'HALTED'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                        <button className="w-10 h-10 rounded-tactile flex items-center justify-center bg-surface-container-low text-primary/40 hover:text-primary transition-all shadow-sm">
                                                            <span className="material-symbols-outlined text-lg">edit_note</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => toggleSlotStatus(slot.id, slot.isActive)}
                                                            className={`w-10 h-10 rounded-tactile flex items-center justify-center transition-all shadow-sm ${slot.isActive ? 'bg-error-container/10 text-error' : 'bg-secondary-container/10 text-secondary'}`}
                                                        >
                                                            <span className="material-symbols-outlined text-lg">{slot.isActive ? 'pause_circle' : 'play_circle'}</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* Registry Modal - Glassmorphic Style */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] !m-0 !top-0 flex items-center justify-center p-4 animate-in fade-in duration-500">
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-surface-container-lowest w-full max-w-xl rounded-tactile shadow-organic-xl overflow-hidden border-0 animate-in zoom-in-95 duration-700">
                        <div className="p-12 bg-surface-container-low flex justify-between items-center">
                            <div>
                                <p className="label mb-2">Protocol Draft</p>
                                <h3 className="text-4xl font-black text-primary tracking-tighter leading-none">Initialize Cycle</h3>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="w-14 h-14 rounded-tactile bg-surface-container-high flex items-center justify-center text-primary/40 hover:text-primary transition-all shadow-organic-sm hover:rotate-90"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreateSlot} className="p-12 space-y-12">
                            <div className="space-y-4">
                                <label className="label text-[9px] ml-1 opacity-40">Scheduled Observation Date</label>
                                <div className="bg-surface-container-low px-8 py-5 rounded-tactile shadow-inner">
                                    <input 
                                        className="w-full bg-transparent border-0 focus:ring-0 text-primary font-black text-lg p-0" 
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={formData.slotDate}
                                        onChange={e => setFormData({...formData, slotDate: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="label text-[9px] ml-1 opacity-40">Window Ingress</label>
                                    <div className="bg-surface-container-low px-8 py-5 rounded-tactile shadow-inner">
                                        <input 
                                            className="w-full bg-transparent border-0 focus:ring-0 text-primary font-black text-lg p-0" 
                                            type="time" 
                                            required
                                            value={formData.startTime}
                                            onChange={e => setFormData({...formData, startTime: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="label text-[9px] ml-1 opacity-40">Window Egress</label>
                                    <div className="bg-surface-container-low px-8 py-5 rounded-tactile shadow-inner">
                                        <input 
                                            className="w-full bg-transparent border-0 focus:ring-0 text-primary font-black text-lg p-0" 
                                            type="time"
                                            required
                                            value={formData.endTime}
                                            onChange={e => setFormData({...formData, endTime: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex justify-between items-end px-1">
                                    <label className="label text-[9px] opacity-40">Stewardship Capacity</label>
                                    <span className="font-black text-primary text-xl tracking-tighter">{formData.totalCapacity} <span className="text-[10px] text-primary/40 uppercase ml-1">Nodes</span></span>
                                </div>
                                <div className="px-2">
                                    <input 
                                        className="w-full h-1.5 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary" 
                                        type="range"
                                        min="10"
                                        max="500"
                                        value={formData.totalCapacity}
                                        onChange={e => setFormData({...formData, totalCapacity: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-8 bg-primary/5 rounded-tactile shadow-sm">
                                <div className="space-y-1">
                                    <p className="label text-primary text-[11px]">Immediate Authorization</p>
                                    <p className="label text-[8px] opacity-40">Publish current node to the live registry.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={formData.isActive}
                                        onChange={e => setFormData({...formData, isActive: e.target.checked})}
                                    />
                                    <div className="w-14 h-8 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-primary after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary/20 shadow-inner group-hover:scale-105 transition-transform"></div>
                                </label>
                            </div>
                            <div className="flex gap-6 pt-6">
                                <button 
                                    type="submit"
                                    className="flex-[2] btn btn--primary py-6 shadow-organic-xl"
                                >
                                    Authorize Cycle
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 btn bg-surface-container-high text-primary/40 py-6 shadow-organic-sm hover:text-primary transition-all"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SlotManagement;
