import React, { useEffect, useState } from 'react';
import api from '../../../core/services/api';
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  AdminSectionTitle,
  AdminStatusBadge,
} from '../components/AdminPrimitives';

const PricingManagementStitch = () => {
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
        api.get('/admin/settings'),
      ]);

      setTickets(ticketRes.data);
      setAddons(addonRes.data);
      setSlotPricing(pricingRes.data);

      const settingsMap = settingsRes.data.reduce((acc, setting) => {
        acc[setting.settingKey] = setting.settingValue;
        return acc;
      }, {});

      if (settingsMap.dynamic_pricing_enabled) {
        setDynamicPricing(settingsMap.dynamic_pricing_enabled === 'true');
      }
      if (settingsMap.manual_overrides_enabled) {
        setManualPricing(settingsMap.manual_overrides_enabled === 'true');
      }
      if (settingsMap.surge_threshold_percent) {
        setThreshold(parseInt(settingsMap.surge_threshold_percent, 10));
      }
    } catch (error) {
      console.error('Error fetching pricing data:', error);
      window.alert('Failed to load pricing data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTicketChange = (id, field, value) => {
    setTickets((current) => current.map((ticket) => (ticket.id === id ? { ...ticket, [field]: value } : ticket)));
  };

  const handleAddonChange = (idOrIndex, field, value) => {
    setAddons((current) => current.map((addon, index) => (
      addon.id === idOrIndex || `new-${index}` === idOrIndex
        ? { ...addon, [field]: value }
        : addon
    )));
  };

  const addNewAddon = () => {
    setAddons((current) => [...current, {
      name: 'New Service',
      type: 'ADDON',
      price: 0,
      isActive: true,
      isNew: true,
      description: '',
    }]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const newAddons = addons.filter((addon) => addon.isNew);
      const existingAddons = addons.filter((addon) => !addon.isNew);

      await Promise.all([
        ...tickets.map((ticket) => api.put(`/admin/tickets/${ticket.id}`, ticket)),
        ...existingAddons.map((addon) => api.put(`/admin/addons/${addon.id}`, addon)),
        ...newAddons.map((addon) => api.post('/admin/addons', {
          name: addon.name,
          type: addon.type,
          price: addon.price,
          description: addon.description,
          imageUrl: addon.imageUrl,
          isActive: addon.isActive,
        })),
        api.put('/admin/settings', { settingKey: 'dynamic_pricing_enabled', settingValue: String(dynamicPricing) }),
        api.put('/admin/settings', { settingKey: 'manual_overrides_enabled', settingValue: String(manualPricing) }),
        api.put('/admin/settings', { settingKey: 'surge_threshold_percent', settingValue: String(threshold) }),
      ]);

      window.alert('Pricing settings saved successfully.');
      fetchData();
    } catch (error) {
      console.error('Error saving pricing data:', error);
      window.alert('Failed to save pricing data.');
    } finally {
      setSaving(false);
    }
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
        eyebrow="Revenue Control"
        title="Pricing Management"
        description="Editorial pricing controls for tickets, dynamic rules, and add-on products."
        action={(
          <button className="btn btn--primary btn--lg shadow-organic-xl" onClick={handleSave} disabled={saving}>
            <span className="material-symbols-outlined">{saving ? 'sync' : 'save'}</span>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-6 lg:col-span-8">
          <AdminPanel>
            <AdminSectionTitle eyebrow="Base Ticket Prices" title="Core admission rules" description="Default prices exposed to the live booking experience." />
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="grid gap-4 rounded-[1.5rem] bg-surface-container-low p-5 md:grid-cols-[1.1fr_0.8fr_0.8fr] md:items-center">
                  <div>
                    <div className="text-lg font-black tracking-tight text-primary">{ticket.name}</div>
                    <div className="text-sm font-medium text-on-surface-variant">Base product in the visitor flow.</div>
                  </div>
                  <div className="input-group">
                    <label className="label">Price</label>
                    <input className="input-field bg-surface-container-lowest" type="number" value={ticket.defaultPrice || 0} onChange={(event) => handleTicketChange(ticket.id, 'defaultPrice', parseFloat(event.target.value) || 0)} />
                  </div>
                  <div className="flex items-center justify-between rounded-[1.25rem] bg-surface-container-lowest px-4 py-4">
                    <span className="label">Status</span>
                    <AdminStatusBadge tone={ticket.isActive ? 'success' : 'warning'}>
                      {ticket.isActive ? 'Active' : 'Offline'}
                    </AdminStatusBadge>
                  </div>
                </div>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel>
            <AdminSectionTitle eyebrow="Slot Overrides" title="Time-based pricing" description="Current manual pricing overrides for specific time windows." />
            {slotPricing.length ? (
              <div className="space-y-3">
                {slotPricing.map((pricing) => (
                  <div key={pricing.id} className="grid gap-4 rounded-[1.5rem] bg-surface-container-low p-5 md:grid-cols-[1fr_auto_auto] md:items-center">
                    <div>
                      <div className="text-lg font-black tracking-tight text-primary">Slot #{pricing.id}</div>
                      <div className="text-sm font-medium text-on-surface-variant">Adult: ₹{pricing.priceAdult} • Child: ₹{pricing.priceChild}</div>
                    </div>
                    <AdminStatusBadge tone="warning">Manual override</AdminStatusBadge>
                    <button className="btn btn--ghost justify-center">Review</button>
                  </div>
                ))}
              </div>
            ) : (
              <AdminEmptyState icon="payments" title="No slot overrides" description="Manual time-based overrides will appear here when configured." />
            )}
          </AdminPanel>
        </div>

        <div className="col-span-12 space-y-6 lg:col-span-4">
          <AdminPanel dark>
            <AdminSectionTitle eyebrow="Surge Pricing" title="Dynamic pricing engine" />
            <div className="space-y-5">
              <label className="flex items-center justify-between">
                <span className="text-sm font-semibold text-background/85">Enable dynamic pricing</span>
                <input type="checkbox" checked={dynamicPricing} onChange={(event) => setDynamicPricing(event.target.checked)} />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm font-semibold text-background/85">Allow manual overrides</span>
                <input type="checkbox" checked={manualPricing} onChange={(event) => setManualPricing(event.target.checked)} />
              </label>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-background/85">Occupancy threshold</span>
                  <span className="text-xl font-black">{threshold}%</span>
                </div>
                <input className="w-full" type="range" min="50" max="100" value={threshold} onChange={(event) => setThreshold(parseInt(event.target.value, 10))} />
              </div>
              <div className="rounded-[1.5rem] bg-background/10 p-4">
                <p className="label mb-2 text-background/60">Engine prediction</p>
                <div className="text-3xl font-black">+{Math.round((100 - threshold) * 2)}%</div>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel muted>
            <AdminSectionTitle eyebrow="Positioning" title="Market status" />
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-on-surface-variant">Arboretum index</span>
                <span className="text-primary">0.96x</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-surface-container-high">
                <div className="h-full w-[96%] rounded-full bg-primary" />
              </div>
              <p className="text-sm font-medium leading-6 text-on-surface-variant">
                Pricing remains aligned with the sustainable stewardship target.
              </p>
            </div>
          </AdminPanel>
        </div>
      </div>

      <AdminPanel>
        <AdminSectionTitle
          eyebrow="Add-On Services"
          title="Supplementary products"
          description="Manage add-ons and premium upsell experiences."
          action={<button className="btn btn--secondary" onClick={addNewAddon}>Add service</button>}
        />
        {addons.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {addons.map((addon, index) => (
              <div key={addon.id || `new-${index}`} className="rounded-[1.75rem] bg-surface-container-low p-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <input className="w-full bg-transparent text-lg font-black tracking-tight text-primary outline-none" value={addon.name} onChange={(event) => handleAddonChange(addon.id || `new-${index}`, 'name', event.target.value)} />
                    <div className="mt-1">
                      <AdminStatusBadge tone={addon.isActive ? 'success' : 'warning'}>
                        {addon.isActive ? 'Active' : 'Inactive'}
                      </AdminStatusBadge>
                    </div>
                  </div>
                  <input type="checkbox" checked={addon.isActive} onChange={(event) => handleAddonChange(addon.id || `new-${index}`, 'isActive', event.target.checked)} />
                </div>
                <div className="space-y-4">
                  <div className="input-group">
                    <label className="label">Type</label>
                    <select className="input-field bg-surface-container-lowest" value={addon.type} onChange={(event) => handleAddonChange(addon.id || `new-${index}`, 'type', event.target.value)}>
                      <option value="PER_PERSON">Per individual</option>
                      <option value="PER_BOOKING">Per booking</option>
                      <option value="ADDON">Add-on</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="label">Price</label>
                    <input className="input-field bg-surface-container-lowest" type="number" value={addon.price || 0} onChange={(event) => handleAddonChange(addon.id || `new-${index}`, 'price', parseFloat(event.target.value) || 0)} />
                  </div>
                  <div className="input-group">
                    <label className="label">Description</label>
                    <textarea className="input-field min-h-[120px] resize-none bg-surface-container-lowest" value={addon.description || ''} onChange={(event) => handleAddonChange(addon.id || `new-${index}`, 'description', event.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AdminEmptyState icon="inventory" title="No add-ons configured" description="Create a new service to add premium experiences to the booking flow." />
        )}
      </AdminPanel>
    </div>
  );
};

export default PricingManagementStitch;
