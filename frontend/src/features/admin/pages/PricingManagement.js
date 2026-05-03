import React, { useState, useEffect } from 'react';
import { FiSave, FiEdit2, FiRefreshCw } from 'react-icons/fi';
import api from '../../services/api';

const PricingManagement = () => {
    const [tickets, setTickets] = useState([]);
    const [addons, setAddons] = useState([]);
    const [slotPricing, setSlotPricing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dynamicPricing, setDynamicPricing] = useState(true);
    const [manualPricing, setManualPricing] = useState(true);
    const [threshold, setThreshold] = useState(90);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ticketRes, addonRes, pricingRes, settingsRes] = await Promise.all([
                api.get('/admin/tickets'),
                api.get('/admin/addons'),
                api.get('/admin/pricing'),
                api.get('/admin/settings')
            ]);
            setTickets(ticketRes.data);
            setAddons(addonRes.data);
            setSlotPricing(pricingRes.data);
            
            // Map settings
            const settingsMap = settingsRes.data.reduce((acc, s) => {
                acc[s.settingKey] = s.settingValue;
                return acc;
            }, {});
            
            if (settingsMap.dynamic_pricing_enabled) {
                setDynamicPricing(settingsMap.dynamic_pricing_enabled === 'true');
            }
            if (settingsMap.manual_overrides_enabled) {
                setManualPricing(settingsMap.manual_overrides_enabled === 'true');
            }
            if (settingsMap.surge_threshold_percent) {
                setThreshold(parseInt(settingsMap.surge_threshold_percent));
            }
        } catch (error) {
            console.error('Error fetching pricing data:', error);
            alert('Failed to load pricing data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTicketChange = (id, field, value) => {
        setTickets(tickets.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const handleAddonChange = (idOrIndex, field, value) => {
        setAddons(addons.map((a, idx) => (a.id === idOrIndex || `new-${idx}` === idOrIndex) ? { ...a, [field]: value } : a));
    };

    const handlePricingChange = (id, field, value) => {
        setSlotPricing(slotPricing.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const addNewAddon = () => {
        setAddons([...addons, { name: 'New Service', type: 'ADDON', price: 0, isActive: true, isNew: true }]);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Separate new addons from existing ones
            const newAddons = addons.filter(a => a.isNew);
            const existingAddons = addons.filter(a => !a.isNew);

            // Save settings, tickets, addons, and slot overrides
            await Promise.all([
                ...tickets.map(t => api.put(`/admin/tickets/${t.id}`, t)),
                ...existingAddons.map(a => api.put(`/admin/addons/${a.id}`, a)),
                ...newAddons.map(a => api.post('/admin/addons', { name: a.name, type: a.type, price: a.price, description: a.description, imageUrl: a.imageUrl, isActive: a.isActive })),
                api.put('/admin/settings', { settingKey: 'dynamic_pricing_enabled', settingValue: String(dynamicPricing) }),
                api.put('/admin/settings', { settingKey: 'manual_overrides_enabled', settingValue: String(manualPricing) }),
                api.put('/admin/settings', { settingKey: 'surge_threshold_percent', settingValue: String(threshold) })
            ]);
            alert('Pricing, Add-Ons, and Dynamic Rules saved successfully!');
            fetchData(); // Refresh to get real IDs for new addons
        } catch (error) {
            console.error('Error saving pricing:', error);
            alert('Failed to save changes. Some updates might have failed.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin text-primary"><FiRefreshCw size={48} /></div>
                <p className="text-on-surface-variant font-medium">Synchronizing Pricing Master...</p>
            </div>
        );
    }

    return (
        <div className="font-headline w-full animate-in fade-in duration-700">
            {/* Header Section */}
            <header className="flex justify-between items-end mb-12">
                <div>
                    <span className="text-on-surface-variant font-label text-sm uppercase tracking-widest mb-2 block">Revenue Control</span>
                    <h2 className="text-4xl font-extrabold text-primary tracking-tight leading-none">Pricing Management</h2>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary-container text-on-primary px-8 py-4 rounded-xl font-bold text-sm flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary-container/20 disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-lg">{saving ? 'sync' : 'save'}</span>
                    {saving ? 'Synchronizing...' : 'Save Changes'}
                </button>
            </header>

            <div className="grid grid-cols-12 gap-8">
                {/* Bento Grid Left Column */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    
                    {/* Base Ticket Prices (Desktop Grids / Mobile Cards) */}
                    <section className="bg-surface-container-lowest p-8 rounded-xl relative overflow-hidden border border-outline-variant/10 shadow-sm">
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 translate-x-12 -translate-y-12">
                            <span className="material-symbols-outlined text-[120px] text-primary">local_activity</span>
                        </div>
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-primary flex items-center gap-3">
                                Base Ticket Prices
                                <span className="bg-secondary-container text-on-secondary-container text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider">Active</span>
                            </h3>
                            <label className="inline-flex items-center cursor-pointer">
                                <span className="mr-3 text-sm font-medium text-on-surface-variant hidden sm:inline">Manual Overrides</span>
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={manualPricing}
                                    onChange={e => setManualPricing(e.target.checked)}
                                />
                                <div className="relative w-11 h-6 bg-surface-container-high rounded-full transition-colors peer-checked:bg-primary-container peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Desktop Header */}
                            <div className="hidden md:grid grid-cols-4 px-4 py-2 text-on-surface-variant font-label text-[10px] uppercase tracking-widest font-bold">
                                <div className="col-span-2">Ticket Type</div>
                                <div>Price (₹)</div>
                                <div className="text-right">Status</div>
                            </div>
                            
                            {tickets.map(ticket => (
                                <div key={ticket.id} className="group bg-surface-container-low hover:bg-surface-container rounded-2xl p-4 md:p-6 transition-all border border-transparent hover:border-primary-container/10">
                                    <div className="flex flex-col md:grid md:grid-cols-4 md:items-center gap-4 md:gap-0">
                                        <div className="md:col-span-2 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary transform group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-2xl">{ticket.name.includes('Adult') ? 'person' : 'child_care'}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-on-surface text-base">{ticket.name}</p>
                                                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold opacity-60">{ticket.description || 'Standard Admission'}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between md:justify-start gap-4">
                                            <div className="md:hidden text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Base Rate</div>
                                            <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl border border-outline-variant/10">
                                                <span className="text-on-surface-variant font-bold">₹</span>
                                                <input 
                                                    className="w-20 bg-transparent border-none focus:ring-0 font-black text-xl p-0" 
                                                    type="number" 
                                                    value={ticket.defaultPrice} 
                                                    onChange={e => handleTicketChange(ticket.id, 'defaultPrice', parseFloat(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between md:justify-end gap-2 p-3 md:p-0 bg-surface-container-high md:bg-transparent rounded-xl">
                                            <div className="md:hidden text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Capacity Status</div>
                                            <span className={`text-[9px] font-black px-4 py-1.5 rounded-full border ${ticket.isActive ? 'bg-secondary-container/30 border-secondary/10 text-secondary' : 'bg-surface-dim/20 border-outline-variant/10 text-on-surface-variant/40'}`}>
                                                {ticket.isActive ? 'OPERATIONAL' : 'OFFLINE'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Slot-Specific Pricing (Desktop Table / Mobile Cards) */}
                    <section className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-primary">Slot-Specific Overrides</h3>
                                <p className="text-sm text-on-surface-variant">Demand-based adjustments per time window</p>
                            </div>
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
                                    <tr>
                                        <th className="pb-4">Slot Window</th>
                                        <th className="pb-4">Adult (₹)</th>
                                        <th className="pb-4">Child (₹)</th>
                                        <th className="pb-4 text-center">Rule</th>
                                        <th className="pb-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-container-low">
                                    {slotPricing.map(p => (
                                        <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-on-surface-variant text-lg">schedule</span>
                                                    <span className="font-bold text-sm">Slot #{p.id}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 font-medium">₹{p.priceAdult}</td>
                                            <td className="py-4 font-medium">₹{p.priceChild}</td>
                                            <td className="py-4">
                                                <div className="flex justify-center">
                                                    <span className="bg-secondary-container/30 text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold">MANUAL</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-right">
                                                <button className="p-2 hover:bg-surface-container-high rounded-lg transition-all">
                                                    <span className="material-symbols-outlined text-on-surface-variant text-lg">edit</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="md:hidden space-y-4">
                            {slotPricing.map(p => (
                                <div key={p.id} className="bg-surface-container-low p-5 rounded-2xl space-y-4 border border-outline-variant/5">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-sm">schedule</span>
                                            <span className="font-bold text-sm">Slot #{p.id}</span>
                                        </div>
                                        <span className="bg-secondary-container/30 text-secondary px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest">Manual</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/50 p-3 rounded-xl">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Adult</p>
                                            <p className="font-black text-on-surface">₹{p.priceAdult}</p>
                                        </div>
                                        <div className="bg-white/50 p-3 rounded-xl">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Child</p>
                                            <p className="font-black text-on-surface">₹{p.priceChild}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {slotPricing.length === 0 && (
                            <div className="py-12 text-center text-on-surface-variant italic text-sm">
                                No slot-specific pricing overrides configured.
                            </div>
                        )}
                    </section>
                </div>

                {/* Bento Grid Right Column */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    
                    {/* Dynamic Pricing Rules Card */}
                    <section className="bg-primary text-on-primary p-8 rounded-xl shadow-xl shadow-primary/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-container/40 to-transparent opacity-50"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-xl font-bold">Surge Pricing</h3>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={dynamicPricing}
                                        onChange={e => setDynamicPricing(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-container"></div>
                                </label>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-[10px] font-label uppercase tracking-widest opacity-70 font-bold">Occupancy Threshold</label>
                                        <span className="text-xl font-bold">{threshold}%</span>
                                    </div>
                                    <input 
                                        className="w-full h-1.5 bg-on-primary/20 rounded-full appearance-none cursor-pointer accent-secondary-container" 
                                        type="range"
                                        min="50"
                                        max="100"
                                        value={threshold}
                                        onChange={e => setThreshold(parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-md">
                                    <p className="text-[10px] font-label uppercase tracking-widest opacity-60 mb-4 font-bold">Engine Prediction</p>
                                    <div className="flex justify-between items-end">
                                        <div className="text-3xl font-black">+{Math.round((100-threshold)*2)}%</div>
                                        <div className="text-right">
                                            <p className="text-[10px] opacity-60 uppercase font-bold">Surge Multiplier</p>
                                            <p className="text-lg font-bold text-secondary-container">Dynamic</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Status Insights */}
                    <section className="bg-surface-container-high p-6 rounded-xl border border-outline-variant/10 shadow-sm">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4 text-on-surface-variant font-label">Market Positioning</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-on-surface-variant font-medium">Arboretum Index</span>
                                <span className="font-bold text-primary">0.96x</span>
                            </div>
                            <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary w-[96%] h-full"></div>
                            </div>
                            <p className="text-[10px] text-on-surface-variant italic font-medium">Pricing is optimized for sustainable stewardship.</p>
                        </div>
                    </section>
                </div>

                {/* Add-On Services Master Section */}
                <div className="col-span-12">
                    <section className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-extrabold text-primary tracking-tight">Add-On Services Master</h3>
                                <p className="text-sm text-on-surface-variant">Managed supplementary experiences for visitors</p>
                            </div>
                            <button 
                                onClick={addNewAddon}
                                className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-container text-on-surface font-bold py-3 px-6 rounded-xl transition-all shadow-sm active:scale-95"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                                Define New Service
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {addons.map((addon, index) => (
                                <div key={addon.id || `new-${index}`} className="group bg-surface-container-low p-6 rounded-xl border border-transparent hover:border-primary-container/20 hover:bg-white hover:shadow-xl transition-all flex flex-col relative overflow-hidden">
                                    {addon.isNew && <div className="absolute top-0 right-0 bg-primary-container text-on-primary text-[8px] font-bold px-4 py-1 rotate-45 translate-x-3 translate-y-1">DRAFT</div>}
                                    
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-500">
                                            <span className="material-symbols-outlined text-primary-container">
                                                {addon.name.toLowerCase().includes('safari') ? 'directions_car' : 
                                                 addon.name.toLowerCase().includes('photo') || addon.name.toLowerCase().includes('camera') ? 'photo_camera' : 
                                                 addon.name.toLowerCase().includes('meal') || addon.name.toLowerCase().includes('food') ? 'restaurant' : 'volunteer_activism'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => {
                                                    if (window.confirm('Delete this artifact?')) {
                                                        setAddons(addons.filter((_, idx) => idx !== index));
                                                    }
                                                }}
                                                className="material-symbols-outlined text-on-surface-variant/40 hover:text-error transition-colors text-sm"
                                            >
                                                delete
                                            </button>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    checked={addon.isActive} 
                                                    onChange={e => handleAddonChange(addon.id || `new-${index}`, 'isActive', e.target.checked)} 
                                                />
                                                <div className="w-9 h-5 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <input 
                                        className="text-lg font-bold mb-1 text-on-surface bg-transparent border-none p-0 focus:ring-0 uppercase tracking-tight"
                                        value={addon.name}
                                        onChange={e => handleAddonChange(addon.id || `new-${index}`, 'name', e.target.value)}
                                    />
                                    <select 
                                        className="text-[10px] text-on-surface-variant mb-6 font-bold uppercase tracking-widest bg-transparent border-none p-0 focus:ring-0"
                                        value={addon.type}
                                        onChange={e => handleAddonChange(addon.id || `new-${index}`, 'type', e.target.value)}
                                    >
                                        <option value="PER_PERSON">Per Individual</option>
                                        <option value="PER_BOOKING">Per Reservation</option>
                                    </select>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <p className="text-[10px] font-label uppercase opacity-60 font-bold tracking-widest">Revenue Impact</p>
                                            <div className="flex items-center">
                                                <span className="text-on-surface font-bold">₹</span>
                                                <input 
                                                    className="font-bold text-xl bg-transparent border-none p-0 focus:ring-0 w-full"
                                                    type="number"
                                                    value={addon.price}
                                                    onChange={e => handleAddonChange(addon.id || `new-${index}`, 'price', parseFloat(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-label uppercase opacity-60 font-bold tracking-widest">Asset Sync</p>
                                            <p className="font-bold text-lg text-primary">Stable</p>
                                        </div>
                                    </div>
                                    
                                    <textarea 
                                        className="text-xs text-on-surface-variant bg-surface-container-low/40 rounded-lg p-3 focus:ring-1 focus:ring-primary outline-none mt-auto resize-none min-h-[60px]"
                                        value={addon.description || ''}
                                        onChange={e => handleAddonChange(addon.id || `new-${index}`, 'description', e.target.value)}
                                        placeholder="Service scope and naturalist requirements..."
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PricingManagement;
