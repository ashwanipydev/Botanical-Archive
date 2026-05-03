import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './BookingFlow.css';

const UserDetailsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const bookingState = location.state || {};

    const [form, setForm] = useState({ fullName: '', mobileNumber: '', email: '' });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/book/payment', { state: { ...bookingState, userDetails: form } });
    };

    const formatAmPm = (timeStr) => {
        if (!timeStr) return '';
        let [h, m] = timeStr.split(':');
        h = parseInt(h);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hh = h % 12 || 12;
        return `${String(hh).padStart(2, '0')}:${m} ${ampm}`;
    };

    const displayDate = bookingState.date ? new Date(bookingState.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

    return (
        <div className="bg-background text-on-surface min-h-screen">
            <header className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-12 md:py-12">
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary-dim">Step 3 of 4</span>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-emerald-900">Guest Information</h1>
                </div>
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 self-start text-on-surface-variant transition-colors hover:text-primary md:self-auto">
                    <span className="material-symbols-outlined">close</span>
                    <span className="font-semibold text-sm">Cancel Booking</span>
                </button>
            </header>

            <main className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Main Form Section */}
                    <section className="lg:col-span-8 space-y-12">
                        <div className="bg-surface-container-low rounded-xl p-8 md:p-12 space-y-10">
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="full_name">Full Name</label>
                                    <input
                                        className="w-full bg-surface-container-high border-none rounded-lg px-6 py-4 focus:ring-2 focus:ring-primary focus:bg-surface-container-highest transition-all text-on-surface placeholder:text-outline/50 outline-none"
                                        id="full_name"
                                        name="fullName"
                                        value={form.fullName}
                                        onChange={handleChange}
                                        placeholder="Enter your full legal name"
                                        type="text"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="mobile_number">Mobile Number</label>
                                        <input
                                            className="w-full bg-surface-container-high border-none rounded-lg px-6 py-4 focus:ring-2 focus:ring-primary focus:bg-surface-container-highest transition-all text-on-surface placeholder:text-outline/50 outline-none"
                                            id="mobile_number"
                                            name="mobileNumber"
                                            value={form.mobileNumber}
                                            onChange={handleChange}
                                            placeholder="+1 (555) 000-0000"
                                            type="tel"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="email_address">Email Address</label>
                                        <input
                                            className="w-full bg-surface-container-high border-none rounded-lg px-6 py-4 focus:ring-2 focus:ring-primary focus:bg-surface-container-highest transition-all text-on-surface placeholder:text-outline/50 outline-none"
                                            id="email_address"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="nature@example.org"
                                            type="email"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Privacy Notice */}
                            <div className="pt-6 flex gap-4 items-start">
                                <span className="material-symbols-outlined text-primary mt-1">verified_user</span>
                                <div className="space-y-2">
                                    <p className="text-sm text-on-surface-variant leading-relaxed">
                                        Your data is handled according to our <a className="underline font-medium text-primary" href="#">Privacy Policy</a>. We use this information only for booking verification and conservation updates relevant to your visit.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Complete Button (Mobile Order) */}
                        <div className="md:hidden">
                            <button type="submit" className="w-full bg-primary text-on-primary py-5 rounded-lg font-bold text-lg shadow-[0px_12px_32px_rgba(70,101,83,0.15)] hover:scale-[0.98] transition-transform">
                                Continue to Payment
                            </button>
                        </div>
                    </section>

                    {/* Sidebar Summary */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-12">
                        <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl overflow-hidden shadow-[0px_12px_32px_rgba(44,52,51,0.06)]">
                            <div className="relative h-32 w-full">
                                <img
                                    className="w-full h-full object-cover"
                                    alt="vibrant botanical garden"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUkG4byymUZGkBJlT7wRMg2HL1DseqYsNBp-7fhoGT8qu-Icv8TsULPPrp2ZGalqIlvOZ4ZjDGwbgGfzm25VLVXbdBbaQIhPRSp1YLLmHOdjO5Gydcl1778fE4iINdzX7WaHLhr0aDfd8-uvDZ7sgGFIVCcgSf_2qZOiJiEs-NchfmVrI8AQkGA2002GcLdMqeR-mN43xMgaU-aISIF_G0F9LLvmK2QhVrVCs10Q59gaCJ_Vz2wUs1ZnM4myVhcojtm278n3ny9g8"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent"></div>
                            </div>
                            <div className="p-8 space-y-8">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Selection</span>
                                    <h3 className="text-xl font-bold text-on-surface mt-1">Sanctuary Pass</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3 text-on-surface-variant">
                                            <span className="material-symbols-outlined text-lg">calendar_today</span>
                                            <span>Date</span>
                                        </div>
                                        <span className="font-bold text-on-surface">{displayDate}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3 text-on-surface-variant">
                                            <span className="material-symbols-outlined text-lg">schedule</span>
                                            <span>Time</span>
                                        </div>
                                        <span className="font-bold text-on-surface">{formatAmPm(bookingState.slot?.startTime)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3 text-on-surface-variant">
                                            <span className="material-symbols-outlined text-lg">confirmation_number</span>
                                            <span>Tickets</span>
                                        </div>
                                        <span className="font-bold text-on-surface">{bookingState.adults || 0}x Adult, {bookingState.children || 0}x Child</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-outline-variant/15 flex justify-between items-end">
                                    <span className="text-sm font-medium text-on-surface-variant">Total Payment</span>
                                    <span className="text-3xl font-extrabold text-emerald-900 tracking-tighter">₹{bookingState.total || 0}.00</span>
                                </div>
                                <button type="submit" className="hidden w-full rounded-lg bg-primary py-4 font-bold text-on-primary shadow-[0px_8px_24px_rgba(70,101,83,0.15)] transition-colors hover:bg-primary-dim md:block">
                                    Continue to Payment
                                </button>
                            </div>
                        </div>
                        <div className="mt-6 flex items-center justify-center gap-2 text-outline text-xs uppercase tracking-widest font-semibold">
                            <span className="material-symbols-outlined text-sm">lock</span>
                            Secure Encryption Enabled
                        </div>
                    </aside>
                </form>
            </main>

            <footer className="bg-stone-100 dark:bg-stone-900 border-t border-stone-200/50 dark:border-stone-800/50 mt-auto">
                <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-8 px-6 py-10 md:flex-row md:px-12 md:py-12">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <span className="text-lg font-bold text-emerald-900 uppercase tracking-tighter">Civic Naturalist Zoo</span>
                        <p className="font-public-sans text-[10px] uppercase tracking-widest text-stone-500 text-center md:text-left">
                            © 2024 Civic Naturalist Botanical Gardens &amp; Zoo. A Sanctuary for Biodiversity.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 md:justify-end md:gap-8">
                        <a className="font-public-sans text-xs uppercase tracking-widest text-stone-500 hover:text-emerald-600 transition-all opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
                        <a className="font-public-sans text-xs uppercase tracking-widest text-stone-500 hover:text-emerald-600 transition-all opacity-80 hover:opacity-100" href="#">Accessibility</a>
                        <a className="font-public-sans text-xs uppercase tracking-widest text-stone-500 hover:text-emerald-600 transition-all opacity-80 hover:opacity-100" href="#">Contact Us</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default UserDetailsPage;
