import React, { useEffect, useMemo, useState } from 'react';
import api from '../../../core/services/api';
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  AdminSectionTitle,
  AdminStatCard,
  AdminStatusBadge,
} from '../components/AdminPrimitives';

const formatCurrency = (value) => `₹${(value || 0).toLocaleString()}`;

const statusTone = (status) => {
  if (status === 'CONFIRMED') return 'success';
  if (status === 'PENDING') return 'warning';
  return 'danger';
};

const BookingManagementStitch = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/bookings/all');
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => bookings.filter((booking) => {
    const statusMatch = statusFilter === 'all' || booking.status?.toLowerCase() === statusFilter;
    const text = search.toLowerCase();
    const searchMatch = !text
      || booking.id.toString().includes(text)
      || booking.user?.fullName?.toLowerCase().includes(text)
      || booking.user?.email?.toLowerCase().includes(text);
    return statusMatch && searchMatch;
  }), [bookings, search, statusFilter]);

  const stats = {
    all: bookings.length,
    confirmed: bookings.filter((booking) => booking.status === 'CONFIRMED').length,
    pending: bookings.filter((booking) => booking.status === 'PENDING').length,
    failed: bookings.filter((booking) => ['FAILED', 'EXPIRED'].includes(booking.status)).length,
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
        eyebrow="Visitor Operations"
        title="Booking Management"
        description="Search, review, and audit live booking records inside the same editorial registry language as the stitch admin reference."
        action={<button className="btn btn--secondary">Export CSV</button>}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard icon="layers" label="All bookings" value={stats.all} meta="Total" accent="primary" />
        <AdminStatCard icon="verified" label="Confirmed" value={stats.confirmed} meta="Cleared" accent="secondary" />
        <AdminStatCard icon="schedule" label="Pending" value={stats.pending} meta="Review" accent="tertiary" />
        <AdminStatCard icon="warning" label="Failed or expired" value={stats.failed} meta="Exceptions" accent="danger" />
      </div>

      <AdminPanel muted>
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr]">
          <div className="input-group">
            <label className="label">Search archive</label>
            <input className="input-field bg-surface-container-lowest" placeholder="Search by ID, name, or email..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <div className="input-group">
            <label className="label">Status filter</label>
            <select className="input-field bg-surface-container-lowest" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed or expired</option>
            </select>
          </div>
        </div>
      </AdminPanel>

      <div className="grid grid-cols-12 gap-6">
        <AdminPanel className="col-span-12 lg:col-span-8">
          <AdminSectionTitle eyebrow="Archive Ledger" title="Booking records" description="Primary operational table for all ticket transactions." />
          {filteredBookings.length ? (
            <div className="space-y-3">
              {filteredBookings.map((booking) => (
                <button
                  key={booking.id}
                  type="button"
                  onClick={() => setSelectedBooking(booking)}
                  className={`w-full rounded-[1.75rem] p-5 text-left transition ${selectedBooking?.id === booking.id ? 'bg-surface-container-high' : 'bg-surface-container-low hover:bg-surface-container-high'}`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-lg font-black tracking-tight text-primary">#ZOO-{String(booking.id).padStart(5, '0')}</div>
                      <div className="mt-1 text-sm font-semibold text-on-surface">{booking.user?.fullName || 'Guest visitor'}</div>
                      <div className="text-xs font-medium text-on-surface-variant">{booking.user?.email || 'No email on file'}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-sm font-semibold text-on-surface-variant">
                        {booking.slot?.slotDate || 'No date'} • {booking.slot?.startTime?.substring(0, 5) || '--:--'}
                      </div>
                      <AdminStatusBadge tone={statusTone(booking.status)}>{booking.status || 'Unknown'}</AdminStatusBadge>
                      <div className="text-base font-black text-primary">{formatCurrency(booking.totalAmount)}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <AdminEmptyState icon="inventory_2" title="No bookings matched" description="Adjust the search text or filter to find the booking records you need." />
          )}
        </AdminPanel>

        <AdminPanel className="col-span-12 lg:col-span-4">
          <AdminSectionTitle eyebrow="Booking Archive" title={selectedBooking ? `#ZOO-${String(selectedBooking.id).padStart(5, '0')}` : 'Select a booking'} description={selectedBooking ? 'Focused detail for the selected transaction.' : 'Choose a booking from the table to inspect visitor and ticket details.'} />
          {selectedBooking ? (
            <div className="space-y-5">
              <div className="rounded-[1.5rem] bg-surface-container-low p-5">
                <p className="label mb-2">Visitor</p>
                <div className="text-lg font-black text-primary">{selectedBooking.user?.fullName || 'Guest visitor'}</div>
                <div className="text-sm font-medium text-on-surface-variant">{selectedBooking.user?.email || 'No email on file'}</div>
              </div>
              <div className="rounded-[1.5rem] bg-surface-container-low p-5">
                <p className="label mb-3">Ticket mix</p>
                <div className="space-y-2 text-sm font-semibold text-on-surface">
                  <div className="flex items-center justify-between"><span>Adults</span><span>{selectedBooking.adultTickets || 0}</span></div>
                  <div className="flex items-center justify-between"><span>Children</span><span>{selectedBooking.childTickets || 0}</span></div>
                  <div className="flex items-center justify-between"><span>Add-on safari</span><span>{formatCurrency(selectedBooking.addOnSafari || 0)}</span></div>
                </div>
              </div>
              <div className="rounded-[1.5rem] bg-primary p-5 text-background">
                <p className="label mb-2 text-background/60">Transaction total</p>
                <div className="text-3xl font-black">{formatCurrency(selectedBooking.totalAmount)}</div>
                <div className="mt-3">
                  <AdminStatusBadge tone="dark">{selectedBooking.status || 'Unknown'}</AdminStatusBadge>
                </div>
              </div>
            </div>
          ) : (
            <AdminEmptyState icon="touch_app" title="No booking selected" description="Use the booking list to open a detail panel and inspect the selected record." />
          )}
        </AdminPanel>
      </div>
    </div>
  );
};

export default BookingManagementStitch;
