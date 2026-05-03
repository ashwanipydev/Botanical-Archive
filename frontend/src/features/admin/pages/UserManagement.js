import React, { useState, useEffect } from 'react';
import { FiSearch, FiUserPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiMail, FiPhone, FiShield, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    
    // Staff Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [staffData, setStaffData] = useState({
        fullName: '', email: '', mobileNumber: '', password: '', roles: ['ROLE_STAFF']
    });

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users/all');
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateOrUpdateStaff = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/admin/staff/${editingId}`, staffData);
            } else {
                await api.post('/admin/staff', staffData);
            }
            setShowModal(false);
            setEditingId(null);
            setStaffData({ fullName: '', email: '', mobileNumber: '', password: '', roles: ['ROLE_STAFF'] });
            fetchUsers();
        } catch (err) {
            console.error("Error saving staff:", err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            try {
                await api.delete(`/admin/staff/${id}`);
                fetchUsers();
            } catch (err) {
                console.error('Failed to delete staff:', err);
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.patch(`/admin/staff/${id}/toggle`);
            fetchUsers();
        } catch (err) {
            console.error('Failed to toggle status:', err);
        }
    };

    const startEdit = (user) => {
        setEditingId(user.id);
        setStaffData({
            fullName: user.fullName,
            email: user.email,
            mobileNumber: user.mobileNumber || '',
            password: '', 
            roles: user.roles.map(r => r.name)
        });
        setShowModal(true);
    };

    const filtered = users.filter(u => {
        const isStaff = u.roles?.some(r => r.name !== 'ROLE_USER');
        const role = isStaff ? 'staff' : 'user';
        
        const matchRole = roleFilter === 'all' || role === roleFilter;
        const matchSearch = !search || 
            u.fullName?.toLowerCase().includes(search.toLowerCase()) || 
            u.email?.toLowerCase().includes(search.toLowerCase());
        return matchRole && matchSearch;
    });

    const getRoleLabel = (u) => {
        if (u.roles?.some(r => r.name === 'ROLE_ADMIN')) return 'Administrator';
        if (u.roles?.some(r => r.name === 'ROLE_GATEKEEPER')) return 'Gatekeeper';
        if (u.roles?.some(r => ['ROLE_STAFF', 'ROLE_SLOTS', 'ROLE_PRICING', 'ROLE_BOOKINGS', 'ROLE_ANALYTICS'].includes(r.name))) return 'Internal Staff';
        return 'Standard User';
    };

    const getRoleColors = (u) => {
        if (u.roles?.some(r => r.name === 'ROLE_ADMIN')) return 'bg-rose-50 text-rose-700 border-rose-100';
        if (u.roles?.some(r => r.name === 'ROLE_GATEKEEPER')) return 'bg-indigo-50 text-indigo-700 border-indigo-100';
        if (u.roles?.some(r => ['ROLE_STAFF', 'ROLE_SLOTS', 'ROLE_PRICING', 'ROLE_BOOKINGS', 'ROLE_ANALYTICS'].includes(r.name))) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        return 'bg-slate-50 text-slate-600 border-slate-100';
    };

    const getAvatarColor = (name) => {
        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500'];
        const charCode = name?.charCodeAt(0) || 0;
        return colors[charCode % colors.length];
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin text-primary"><span className="material-symbols-outlined text-4xl">sync</span></div>
                <p className="text-on-surface-variant font-medium">Synchronizing Steward Directory...</p>
            </div>
        );
    }

    return (
        <div className="font-headline w-full animate-in fade-in duration-1000">
            {/* Header section with Action */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
                <div>
                    <p className="label mb-3">Personnel Registry</p>
                    <h2 className="text-5xl font-black text-primary tracking-tighter leading-none">Steward<br/>Directory</h2>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="btn btn--primary btn--lg shadow-organic-xl flex items-center gap-3"
                >
                    <span className="material-symbols-outlined text-xl">person_add</span>
                    Provision Steward
                </button>
            </header>

            {/* Filter & Search - Tactile Bento Style */}
            <div className="bg-surface-container-low p-6 rounded-tactile flex flex-wrap items-center gap-6 mb-12 shadow-organic-sm">
                <div className="flex-1 min-w-[300px] relative">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary/30">search</span>
                    <input 
                        className="input-field pl-14 py-4 bg-surface-container-lowest border-0" 
                        placeholder="Search specimen identity or archival email..." 
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 bg-surface-container-high p-2 rounded-tactile">
                    {['all', 'user', 'staff'].map(r => (
                        <button 
                            key={r} 
                            onClick={() => setRoleFilter(r)}
                            className={`px-8 py-3 rounded-tactile label transition-all duration-500 ${roleFilter === r ? 'bg-surface-container-lowest text-primary shadow-organic-sm' : 'text-primary/40 hover:text-primary'}`}
                        >
                            {r}s
                        </button>
                    ))}
                </div>
            </div>

            {/* Directory Index */}
            <div className="space-y-8">
                {/* Desktop View Table: No-Line Rule Compliance */}
                <div className="hidden md:block bg-surface-container-lowest rounded-tactile shadow-organic-lg overflow-hidden mb-12 border-0">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-surface-container-low label text-primary/40">
                                <th className="px-10 py-8">Specimen Identity</th>
                                <th className="px-10 py-8">Clearance Role</th>
                                <th className="px-10 py-8">Archival Status</th>
                                <th className="px-10 py-8 text-right">Audit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-0">
                            {filtered.map(u => (
                                <tr key={u.id} className="hover:bg-surface-container-low/50 transition-all group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-16 h-16 rounded-tactile ${getAvatarColor(u.fullName)} text-background flex items-center justify-center font-black text-2xl shadow-organic-sm transform group-hover:rotate-2 transition-transform`}>
                                                {u.fullName?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-black text-primary text-lg tracking-tight mb-1">{u.fullName}</div>
                                                <div className="label opacity-40">#ARC-{u.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-3">
                                            <span className={`w-fit px-5 py-1.5 label rounded-full shadow-sm ${
                                                u.roles?.some(r => r.name === 'ROLE_ADMIN') ? 'bg-error-container/20 text-error' : 
                                                u.roles?.some(r => r.name === 'ROLE_GATEKEEPER') ? 'bg-secondary-container/20 text-secondary' : 
                                                'bg-surface-container-high text-primary/60'
                                            }`}>
                                                {getRoleLabel(u)}
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                {u.roles?.filter(r => !['ROLE_USER', 'ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_GATEKEEPER'].includes(r.name)).map(r => (
                                                    <span key={r.name} className="px-3 py-1 bg-surface-container-low text-[9px] font-black uppercase tracking-widest rounded-full opacity-60">
                                                        {r.name.replace('ROLE_', '')}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className={`flex items-center gap-3 px-4 py-2 rounded-full w-fit shadow-sm ${u.isActive !== false ? 'bg-secondary-container/20 text-secondary' : 'bg-surface-container-high text-primary/40'}`}>
                                            <div className={`w-2.5 h-2.5 rounded-full ${u.isActive !== false ? 'bg-secondary animate-pulse' : 'bg-primary/20'}`}></div>
                                            <span className="label text-[9px]">{u.isActive !== false ? 'Registry Active' : 'Access Revoked'}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-3 group-hover:opacity-100 opacity-0 transition-all translate-x-4 group-hover:translate-x-0">
                                            <button 
                                                onClick={() => handleToggleStatus(u.id)}
                                                className={`w-12 h-12 flex items-center justify-center rounded-tactile transition-all ${u.isActive !== false ? 'bg-error-container/10 text-error hover:bg-error-container/20' : 'bg-secondary-container/10 text-secondary hover:bg-secondary-container/20'}`}
                                            >
                                                <span className="material-symbols-outlined text-xl">{u.isActive !== false ? 'lock' : 'lock_open'}</span>
                                            </button>
                                            <button 
                                                onClick={() => startEdit(u)}
                                                className="w-12 h-12 flex items-center justify-center bg-surface-container-low text-primary rounded-tactile hover:bg-primary hover:text-background transition-all shadow-organic-sm"
                                            >
                                                <span className="material-symbols-outlined text-xl">edit_note</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(u.id)}
                                                className="w-12 h-12 flex items-center justify-center text-error/30 hover:text-error hover:bg-error-container/10 rounded-tactile transition-all"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete_forever</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View Cards */}
                <div className="md:hidden space-y-6">
                    {filtered.map(u => (
                        <div key={u.id} className="bg-surface-container-lowest p-8 rounded-tactile shadow-organic-md space-y-8 border-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-tactile ${getAvatarColor(u.fullName)} text-background flex items-center justify-center font-black text-xl shadow-organic-sm`}>
                                        {u.fullName?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-primary text-base tracking-tight mb-1">{u.fullName}</h3>
                                        <p className="label opacity-40">#ARC-{u.id}</p>
                                    </div>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full shadow-sm ${u.isActive !== false ? 'bg-secondary-container/20 text-secondary' : 'bg-surface-container-high text-primary/40'}`}>
                                    <span className="label text-[9px]">{u.isActive !== false ? 'Active' : 'Locked'}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <span className={`px-4 py-1.5 rounded-full label text-[9px] ${
                                    u.roles?.some(r => r.name === 'ROLE_ADMIN') ? 'bg-error-container/20 text-error' : 'bg-surface-container-high text-primary/60'
                                }`}>
                                    {getRoleLabel(u)}
                                </span>
                                {u.roles?.filter(r => !['ROLE_USER', 'ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_GATEKEEPER'].includes(r.name)).map(r => (
                                    <span key={r.name} className="px-3 py-1 bg-surface-container-low text-[8px] font-black uppercase tracking-widest rounded-full opacity-60">
                                        {r.name.replace('ROLE_', '')}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button 
                                    onClick={() => startEdit(u)}
                                    className="flex-1 bg-surface-container-low text-primary py-4 rounded-tactile label text-[10px] flex items-center justify-center gap-3 shadow-organic-sm"
                                >
                                    <span className="material-symbols-outlined text-lg">edit_note</span>
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleToggleStatus(u.id)}
                                    className="flex-1 bg-surface-container-low text-primary/40 py-4 rounded-tactile label text-[10px] flex items-center justify-center gap-3 shadow-organic-sm"
                                >
                                    <span className="material-symbols-outlined text-lg">{u.isActive !== false ? 'lock' : 'lock_open'}</span>
                                    Status
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal: Editorial Glassmorphism Style */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] !m-0 !top-0 flex items-center justify-center p-4 animate-in fade-in duration-500">
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-md" onClick={() => { setShowModal(false); setEditingId(null); }}></div>
                    <div className="relative bg-surface-container-lowest rounded-tactile shadow-organic-xl w-full max-w-2xl overflow-hidden border-0 animate-in zoom-in-95 duration-700">
                        <div className="px-10 py-12 bg-surface-container-low flex justify-between items-center">
                            <div>
                                <p className="label mb-2">Protocol Registry</p>
                                <h2 className="text-4xl font-black text-primary tracking-tighter leading-none">
                                    {editingId ? 'Refine Stewardship' : 'Provision Steward'}
                                </h2>
                            </div>
                            <button onClick={() => { setShowModal(false); setEditingId(null); }} className="w-14 h-14 rounded-tactile bg-surface-container-high flex items-center justify-center text-primary/40 hover:text-primary transition-all shadow-organic-sm hover:rotate-90">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateOrUpdateStaff} className="p-10 space-y-12 max-h-[75vh] overflow-y-auto hide-scrollbar">
                            {/* Personal Details */}
                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shadow-sm">
                                        <span className="material-symbols-outlined text-xl">fingerprint</span>
                                    </div>
                                    <h3 className="label text-primary">Specimen Credentials</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="label text-[9px] ml-1 opacity-40">Registry Name</label>
                                        <input 
                                            required
                                            className="input-field py-4 px-6 bg-surface-container-low border-0"
                                            placeholder="Linnean Specimen"
                                            value={staffData.fullName}
                                            onChange={e => setStaffData({...staffData, fullName: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="label text-[9px] ml-1 opacity-40">Archival Email</label>
                                        <input 
                                            type="email" required
                                            className="input-field py-4 px-6 bg-surface-container-low border-0"
                                            placeholder="steward@archive.bot"
                                            value={staffData.email}
                                            onChange={e => setStaffData({...staffData, email: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="label text-[9px] ml-1 opacity-40">Security Key</label>
                                        <input 
                                            type="password"
                                            required={!editingId}
                                            className="input-field py-4 px-6 bg-surface-container-low border-0"
                                            placeholder={editingId ? "Encrypted Connection" : "Secure Archive Key"}
                                            value={staffData.password}
                                            onChange={e => setStaffData({...staffData, password: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="label text-[9px] ml-1 opacity-40">Cellular Identity</label>
                                        <input 
                                            className="input-field py-4 px-6 bg-surface-container-low border-0"
                                            placeholder="+Specimen Frequency"
                                            value={staffData.mobileNumber}
                                            onChange={e => setStaffData({...staffData, mobileNumber: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Role Selection */}
                            <section className="space-y-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary shadow-sm">
                                        <span className="material-symbols-outlined text-xl">shield</span>
                                    </div>
                                    <h3 className="label text-secondary">Registry Clearance</h3>
                                </div>
                                <div className="space-y-8">
                                    <div className="flex p-2 bg-surface-container-high rounded-tactile gap-2">
                                        {[
                                            { id: 'ROLE_STAFF', label: 'Archival Staff' },
                                            { id: 'ROLE_GATEKEEPER', label: 'Gate Steward' },
                                            { id: 'ROLE_ADMIN', label: 'Directorate' }
                                        ].map(item => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => {
                                                    const primaryRoles = ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_GATEKEEPER'];
                                                    const otherRoles = staffData.roles.filter(r => !primaryRoles.includes(r));
                                                    setStaffData({...staffData, roles: [item.id, ...otherRoles]});
                                                }}
                                                className={`flex-1 py-4 px-3 rounded-tactile label text-[9px] transition-all duration-700 ${staffData.roles.includes(item.id) ? 'bg-surface-container-lowest text-primary shadow-organic-md' : 'text-primary/30 hover:text-primary'}`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-6">
                                        {[
                                            { role: 'ROLE_SLOTS', label: 'Inventory', desc: 'Registry sync', icon: 'stadium' },
                                            { role: 'ROLE_PRICING', label: 'Ecofinance', desc: 'Fiscal logic', icon: 'payments' },
                                            { role: 'ROLE_BOOKINGS', label: 'Logistics', desc: 'Archival audit', icon: 'event_available' },
                                            { role: 'ROLE_ANALYTICS', label: 'Analytics', desc: 'Data synthesis', icon: 'monitoring' }
                                        ].map(item => (
                                            <button
                                                key={item.role}
                                                type="button"
                                                onClick={() => {
                                                    const roles = staffData.roles.includes(item.role) 
                                                        ? staffData.roles.filter(r => r !== item.role)
                                                        : [...staffData.roles, item.role];
                                                    setStaffData({...staffData, roles});
                                                }}
                                                className={`p-6 rounded-tactile border-0 text-left flex gap-5 transition-all duration-500 shadow-organic-sm ${staffData.roles.includes(item.role) ? 'bg-primary/5 ring-2 ring-primary/20' : 'bg-surface-container-low hover:bg-surface-container-high'}`}
                                            >
                                                <div className={`w-12 h-12 rounded-tactile flex items-center justify-center transition-all ${staffData.roles.includes(item.role) ? 'bg-primary text-background shadow-organic-sm' : 'bg-surface-container-highest text-primary/20'}`}>
                                                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`label text-[10px] mb-1 ${staffData.roles.includes(item.role) ? 'text-primary' : 'text-primary/40'}`}>{item.label}</div>
                                                    <div className="label text-[8px] opacity-40 leading-tight">{item.desc}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </section>
                            
                            <div className="pt-8 flex gap-5">
                                <button type="submit" className="btn btn--primary flex-[2] py-6 shadow-organic-xl">
                                    {editingId ? 'Refine Clearance' : 'Authorize Archive'}
                                </button>
                                <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="btn bg-surface-container-high text-primary/40 flex-1 py-6 shadow-organic-sm hover:text-primary">
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

export default UserManagement;
