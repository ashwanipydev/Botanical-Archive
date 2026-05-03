import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../../core/services/api';
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  AdminSectionTitle,
  AdminStatusBadge,
} from '../components/AdminPrimitives';

const normalizeDate = (slotDate) => {
  if (typeof slotDate === 'string') return slotDate;
  if (Array.isArray(slotDate)) {
    const [year, month, day] = slotDate;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return '';
};

const SlotManagementStitch = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    slotDate: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    totalCapacity: 100,
    isActive: true,
  });

  const fetchSlots = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/slots/');
      const dateFiltered = response.data.filter((slot) => normalizeDate(slot.slotDate) === selectedDate);
      setSlots(dateFiltered);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const filteredSlots = useMemo(() => {
    if (filter === 'active') return slots.filter((slot) => slot.isActive);
    if (filter === 'inactive') return slots.filter((slot) => !slot.isActive);
    return slots;
  }, [filter, slots]);

  const handleCreateSlot = async (event) => {
    event.preventDefault();

    try {
      await api.post('/slots/', {
        ...formData,
        availableCapacity: formData.totalCapacity,
      });
      setShowModal(false);
      setFormData({
        slotDate: selectedDate,
        startTime: '',
        endTime: '',
        totalCapacity: 100,
        isActive: true,
      });
      fetchSlots();
    } catch (error) {
      console.error('Error creating slot:', error);
      window.alert('Failed to create slot.');
    }
  };

  const toggleSlotStatus = async (id, currentStatus) => {
    try {
      const slot = slots.find((entry) => entry.id === id);
      await api.put(`/slots/${id}`, { ...slot, isActive: !currentStatus });
      fetchSlots();
    } catch (error) {
      console.error('Error toggling slot:', error);
    }
  };

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Temporal Distribution"
        title="Slot Management"
        description="Match the live registry to the editorial admin concept while keeping slot capacity and activation workflows intact."
        action={(
          <button
            className="btn btn--primary btn--lg shadow-organic-xl"
            onClick={() => {
              setFormData((current) => ({ ...current, slotDate: selectedDate }));
              setShowModal(true);
            }}
          >
            <span className="material-symbols-outlined">add_circle</span>
            New Slot
          </button>
        )}
      />

      <AdminPanel muted>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <div className="input-group">
            <label className="label">Observation date</label>
            <input type="date" min={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="input-field bg-surface-container-lowest" />
          </div>
          <div className="input-group">
            <label className="label">Registry filter</label>
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="input-field bg-surface-container-lowest">
              <option value="all">All cycles</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>
          <div className="rounded-[1.5rem] bg-surface-container-lowest px-5 py-4">
            <p className="label mb-1">Visible nodes</p>
            <div className="text-2xl font-black tracking-tight text-primary">{filteredSlots.length}</div>
          </div>
        </div>
      </AdminPanel>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-surface-container-high border-t-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {filteredSlots.length ? filteredSlots.map((slot) => {
              const used = (slot.totalCapacity || 0) - (slot.availableCapacity || 0);
              const occupancy = slot.totalCapacity ? Math.round((used / slot.totalCapacity) * 100) : 0;

              return (
                <AdminPanel key={slot.id} className="h-full">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <p className="label mb-2">Access window</p>
                      <h3 className="text-2xl font-black tracking-tight text-primary">
                        {slot.startTime?.substring(0, 5)} - {slot.endTime?.substring(0, 5)}
                      </h3>
                    </div>
                    <AdminStatusBadge tone={slot.isActive ? 'success' : 'warning'}>
                      {slot.isActive ? 'Active' : 'Paused'}
                    </AdminStatusBadge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-on-surface-variant">
                      <span>Used capacity</span>
                      <span>{used}/{slot.totalCapacity}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-surface-container-high">
                      <div className={`h-full rounded-full ${occupancy > 85 ? 'bg-error' : 'bg-primary'}`} style={{ width: `${occupancy}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-[1.25rem] bg-surface-container-low p-4">
                        <p className="label mb-1">Available</p>
                        <div className="text-xl font-black text-primary">{slot.availableCapacity}</div>
                      </div>
                      <div className="rounded-[1.25rem] bg-surface-container-low p-4">
                        <p className="label mb-1">Occupancy</p>
                        <div className="text-xl font-black text-primary">{occupancy}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button className="btn btn--ghost flex-1 justify-center">Edit</button>
                    <button
                      className={`btn flex-1 justify-center ${slot.isActive ? 'bg-error-container text-error' : 'bg-secondary-container text-on-secondary-container'}`}
                      onClick={() => toggleSlotStatus(slot.id, slot.isActive)}
                    >
                      {slot.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </AdminPanel>
              );
            }) : (
              <div className="lg:col-span-3">
                <AdminEmptyState icon="event_busy" title="No slots for this date" description="Create a new slot to populate the live registry for the selected day." />
              </div>
            )}
          </div>

          <AdminPanel>
            <AdminSectionTitle eyebrow="Archive Index" title="Slot registry details" description="Detailed operational view of slot capacity, availability, and status." />
            {filteredSlots.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="label text-primary/50">
                      <th className="pb-4 pr-6">Window</th>
                      <th className="pb-4 pr-6">Capacity</th>
                      <th className="pb-4 pr-6">Used</th>
                      <th className="pb-4 pr-6">Available</th>
                      <th className="pb-4 pr-6">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSlots.map((slot) => (
                      <tr key={slot.id} className="border-t border-surface-container-low">
                        <td className="py-5 pr-6 font-black text-primary">{slot.startTime?.substring(0, 5)} - {slot.endTime?.substring(0, 5)}</td>
                        <td className="py-5 pr-6">{slot.totalCapacity}</td>
                        <td className="py-5 pr-6">{(slot.totalCapacity || 0) - (slot.availableCapacity || 0)}</td>
                        <td className="py-5 pr-6">{slot.availableCapacity}</td>
                        <td className="py-5 pr-6">
                          <AdminStatusBadge tone={slot.isActive ? 'success' : 'warning'}>
                            {slot.isActive ? 'Active' : 'Inactive'}
                          </AdminStatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </AdminPanel>
        </>
      )}

      {showModal ? (
        <div className="fixed inset-0 z-[9999] !m-0 !top-0 flex items-center justify-center bg-primary/20 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-[2rem] bg-surface-container-lowest shadow-organic-xl">
            <div className="flex items-center justify-between rounded-t-[2rem] bg-surface-container-low px-8 py-7">
              <div>
                <p className="label mb-2">Protocol Draft</p>
                <h2 className="text-3xl font-black tracking-tight text-primary">Initialize Cycle</h2>
              </div>
              <button className="btn btn--ghost" onClick={() => setShowModal(false)}>Close</button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-6 p-8">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="input-group">
                  <label className="label">Scheduled date</label>
                  <input type="date" required min={new Date().toISOString().split('T')[0]} value={formData.slotDate} onChange={(event) => setFormData({ ...formData, slotDate: event.target.value })} className="input-field" />
                </div>
                <div className="input-group">
                  <label className="label">Capacity</label>
                  <input type="number" min="1" required value={formData.totalCapacity} onChange={(event) => setFormData({ ...formData, totalCapacity: parseInt(event.target.value, 10) || 0 })} className="input-field" />
                </div>
                <div className="input-group">
                  <label className="label">Start time</label>
                  <input type="time" required value={formData.startTime} onChange={(event) => setFormData({ ...formData, startTime: event.target.value })} className="input-field" />
                </div>
                <div className="input-group">
                  <label className="label">End time</label>
                  <input type="time" required value={formData.endTime} onChange={(event) => setFormData({ ...formData, endTime: event.target.value })} className="input-field" />
                </div>
              </div>

              <label className="flex items-center justify-between rounded-[1.5rem] bg-surface-container-low px-5 py-4">
                <div>
                  <p className="label mb-1">Activate immediately</p>
                  <p className="text-sm font-medium text-on-surface-variant">Publish the slot to the live registry as soon as it is created.</p>
                </div>
                <input type="checkbox" checked={formData.isActive} onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })} />
              </label>

              <div className="flex gap-3">
                <button type="submit" className="btn btn--primary flex-1 justify-center">Create slot</button>
                <button type="button" className="btn btn--ghost flex-1 justify-center" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SlotManagementStitch;
