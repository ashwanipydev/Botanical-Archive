import React, { useEffect, useMemo, useState } from 'react';
import api from '../../../core/services/api';
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  AdminSectionTitle,
  AdminStatusBadge,
} from '../components/AdminPrimitives';

const primaryRoles = ['ROLE_STAFF', 'ROLE_GATEKEEPER', 'ROLE_ADMIN'];

const UserManagementStitch = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [staffData, setStaffData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    roles: ['ROLE_STAFF'],
  });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/all');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => users.filter((user) => {
    const isStaff = user.roles?.some((role) => role.name !== 'ROLE_USER');
    const role = isStaff ? 'staff' : 'user';
    const matchesRole = roleFilter === 'all' || role === roleFilter;
    const text = search.toLowerCase();
    const matchesSearch = !text
      || user.fullName?.toLowerCase().includes(text)
      || user.email?.toLowerCase().includes(text);

    return matchesRole && matchesSearch;
  }), [roleFilter, search, users]);

  const getRoleLabel = (user) => {
    if (user.roles?.some((role) => role.name === 'ROLE_ADMIN')) return 'Administrator';
    if (user.roles?.some((role) => role.name === 'ROLE_GATEKEEPER')) return 'Gatekeeper';
    if (user.roles?.some((role) => role.name !== 'ROLE_USER')) return 'Internal Staff';
    return 'Standard User';
  };

  const handleCreateOrUpdateStaff = async (event) => {
    event.preventDefault();

    try {
      if (editingId) {
        await api.put(`/admin/staff/${editingId}`, staffData);
      } else {
        await api.post('/admin/staff', staffData);
      }

      setShowModal(false);
      setEditingId(null);
      setStaffData({
        fullName: '',
        email: '',
        mobileNumber: '',
        password: '',
        roles: ['ROLE_STAFF'],
      });
      fetchUsers();
    } catch (error) {
      console.error('Error saving staff:', error);
      window.alert('Failed to save staff member.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this staff member?')) return;

    try {
      await api.delete(`/admin/staff/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete staff:', error);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/admin/staff/${id}/toggle`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setStaffData({
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber || '',
      password: '',
      roles: user.roles.map((role) => role.name),
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-surface-container-high border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Personnel Registry"
        title="User Management"
        description="Manage staff, access levels, and operational identities within the Botanical Archive."
        action={<button className="btn btn--primary btn--lg shadow-organic-xl" onClick={() => setShowModal(true)}>Add Steward</button>}
      />

      <AdminPanel muted className="px-4 py-5 sm:px-6 sm:py-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_auto] items-end">
          <div className="input-group">
            <label className="label">Search registry</label>
            <input className="input-field bg-surface-container-lowest" placeholder="Search by name or email..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'user', 'staff'].map((value) => (
              <button
                key={value}
                className={`flex-1 sm:flex-initial rounded-full px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] transition-all ${roleFilter === value ? 'bg-primary text-background shadow-organic-md' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'}`}
                onClick={() => setRoleFilter(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </AdminPanel>

      <AdminPanel>
        <AdminSectionTitle eyebrow="Directory Index" title="Steward directory" description="Live identity registry for standard users and privileged staff." />
        {filteredUsers.length ? (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex flex-col gap-4 rounded-[1.75rem] bg-surface-container-low p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-black text-background">
                    {user.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="text-lg font-black tracking-tight text-primary">{user.fullName}</div>
                    <div className="text-sm font-medium text-on-surface-variant">{user.email}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <AdminStatusBadge tone={user.isActive !== false ? 'success' : 'warning'}>
                    {user.isActive !== false ? 'Active' : 'Locked'}
                  </AdminStatusBadge>
                  <AdminStatusBadge tone="neutral">{getRoleLabel(user)}</AdminStatusBadge>
                  <button className="btn btn--ghost justify-center" onClick={() => handleToggleStatus(user.id)}>
                    {user.isActive !== false ? 'Lock' : 'Unlock'}
                  </button>
                  <button className="btn btn--secondary justify-center" onClick={() => startEdit(user)}>Edit</button>
                  <button className="btn justify-center bg-error-container text-error" onClick={() => handleDelete(user.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AdminEmptyState icon="group_off" title="No users matched" description="Try a different search term or filter to locate the user record you need." />
        )}
      </AdminPanel>

      {/* Steward Dossier Redesign */}
      {showModal ? (
        <div className="fixed inset-0 z-[9999] !m-0 !top-0 flex items-center justify-center bg-primary/25 p-2 sm:p-6 backdrop-blur-xl transition-all duration-500">
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => { setShowModal(false); setEditingId(null); }}
          ></div>
          
          <div className="relative flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] bg-surface-container-lowest shadow-2xl animate-in fade-in zoom-in-95 duration-500 md:flex-row">
            {/* Dossier Sidebar - Visual Identity */}
            <div className="flex w-full flex-col bg-surface-container-low p-6 sm:p-10 md:w-80">
              <div className="mb-8 flex items-center justify-between md:flex-col md:items-start md:gap-8">
                <button className="btn btn--ghost h-12 w-12 rounded-2xl p-0 md:bg-surface-container-lowest shadow-sm" onClick={() => { setShowModal(false); setEditingId(null); }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
                <div className="flex items-center gap-4 md:flex-col md:items-start">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[2rem] bg-primary text-2xl font-black text-background md:h-24 md:w-24 md:text-4xl">
                    {staffData.fullName ? staffData.fullName.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div>
                    <p className="label mb-1">Steward Status</p>
                    <AdminStatusBadge tone={editingId ? 'success' : 'warning'}>
                      {editingId ? 'Active Duty' : 'Awaiting Provisioning'}
                    </AdminStatusBadge>
                  </div>
                </div>
              </div>

              <div className="mt-auto hidden space-y-6 md:block">
                <div className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm">
                  <p className="label mb-3">Clearance Log</p>
                  <p className="text-xs font-medium leading-relaxed text-on-surface-variant">
                    {editingId 
                      ? 'This dossier contains authorized record updates for established stewards of the Arboretum registry.' 
                      : 'Create a new entry in the naturalist protocol registry to grant site-wide clearance.'}
                  </p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 opacity-40">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Security Protocol Alpha</span>
                </div>
              </div>
            </div>

            {/* Dossier Content - The Workspace */}
            <div className="flex flex-1 flex-col overflow-y-auto">
              <header className="sticky top-0 z-10 border-b border-surface-container-high bg-surface-container-lowest/80 px-8 py-8 backdrop-blur-md">
                <p className="label mb-2">Administrative Dossier</p>
                <h2 className="text-3xl font-black tracking-tight text-primary">
                  {editingId ? 'Refine Steward Profile' : 'Registry Entry Creation'}
                </h2>
              </header>

              <form onSubmit={handleCreateOrUpdateStaff} className="flex-1 space-y-10 p-8 pb-32">
                <section>
                  <AdminSectionTitle eyebrow="Identity" title="Personal Details" />
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="input-group">
                      <label className="label">Full Legal Name</label>
                      <input required className="input-field" placeholder="e.g. Julian North" value={staffData.fullName} onChange={(event) => setStaffData({ ...staffData, fullName: event.target.value })} />
                    </div>
                    <div className="input-group">
                      <label className="label">Institutional Email</label>
                      <input required type="email" className="input-field" placeholder="steward@arboretum.org" value={staffData.email} onChange={(event) => setStaffData({ ...staffData, email: event.target.value })} />
                    </div>
                    <div className="input-group">
                      <label className="label">Comm Protocol (Mobile)</label>
                      <input className="input-field" placeholder="+1 (555) 000-0000" value={staffData.mobileNumber} onChange={(event) => setStaffData({ ...staffData, mobileNumber: event.target.value })} />
                    </div>
                    <div className="input-group">
                      <label className="label">Access Cipher (Password)</label>
                      <input required={!editingId} type="password" className="input-field" placeholder={editingId ? 'Leave blank to keep current' : 'Define secure passphrase'} value={staffData.password} onChange={(event) => setStaffData({ ...staffData, password: event.target.value })} />
                    </div>
                  </div>
                </section>

                <section>
                  <AdminSectionTitle eyebrow="Access Control" title="Primary Steward Role" />
                  <div className="grid gap-4 sm:grid-cols-3">
                    {primaryRoles.map((role) => (
                      <button
                        key={role}
                        type="button"
                        className={`group relative overflow-hidden rounded-3xl p-5 text-left transition-all ${staffData.roles.includes(role) ? 'bg-primary text-background shadow-lg' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}
                        onClick={() => {
                          const additionalRoles = staffData.roles.filter((item) => !primaryRoles.includes(item));
                          setStaffData({ ...staffData, roles: [role, ...additionalRoles] });
                        }}
                      >
                        <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${staffData.roles.includes(role) ? 'bg-white/20' : 'bg-surface-container-highest text-primary'}`}>
                          <span className="material-symbols-outlined text-[20px]">
                            {role === 'ROLE_ADMIN' ? 'shield_person' : role === 'ROLE_STAFF' ? 'badge' : 'person'}
                          </span>
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest opacity-60">Designation</p>
                        <p className="text-lg font-black tracking-tight">{role.replace('ROLE_', '').replace('_', ' ')}</p>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <AdminSectionTitle eyebrow="Permissions" title="Specific Clearances" description="Grant granular access to administrative modules below primary role." />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { role: 'ROLE_SLOTS', label: 'Slot Scheduler', icon: 'schedule' },
                      { role: 'ROLE_PRICING', label: 'Rate Auditor', icon: 'payments' },
                      { role: 'ROLE_BOOKINGS', label: 'Entry Marshal', icon: 'confirmation_number' },
                      { role: 'ROLE_ANALYTICS', label: 'Data Naturalist', icon: 'monitoring' }
                    ].map(({ role, label, icon }) => (
                      <label key={role} className={`flex cursor-pointer items-center gap-4 rounded-3xl p-5 transition-all ${staffData.roles.includes(role) ? 'bg-primary-container/10 ring-2 ring-primary/20' : 'bg-surface-container-low hover:bg-surface-container-high'}`}>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${staffData.roles.includes(role) ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                          <span className="material-symbols-outlined text-[20px]">{icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black tracking-tight text-on-surface">{label}</p>
                          <p className="text-[10px] font-medium text-on-surface-variant opacity-60 uppercase tracking-widest">{role.replace('ROLE_', '').replace('_', ' ')}</p>
                        </div>
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded-lg border-none bg-surface-container-highest text-primary transition-all focus:ring-primary/20"
                          checked={staffData.roles.includes(role)}
                          onChange={(event) => {
                            setStaffData((current) => ({
                              ...current,
                              roles: event.target.checked
                                ? [...current.roles, role]
                                : current.roles.filter((item) => item !== role),
                            }));
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </section>

                <footer className="sticky bottom-0 z-20 flex w-full gap-4 border-t border-surface-container-high bg-surface-container-lowest/90 px-8 py-6 backdrop-blur-lg">
                  <button type="submit" className="btn btn--primary flex-1 justify-center py-5 shadow-organic-lg">
                    {editingId ? 'Authorize Update' : 'Finalize Creation'}
                  </button>
                  <button type="button" className="btn btn--ghost flex-1 justify-center py-5" onClick={() => { setShowModal(false); setEditingId(null); }}>
                    Discard
                  </button>
                </footer>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default UserManagementStitch;
