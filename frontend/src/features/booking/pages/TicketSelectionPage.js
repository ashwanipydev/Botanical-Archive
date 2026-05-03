import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../../../core/services/api';
import './BookingFlow.css';

const TicketSelectionPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { date, slot } = location.state || {};

    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(1);
    const [availableAddons, setAvailableAddons] = useState([]);
    const [selectedAddons, setSelectedAddons] = useState({}); // { id: boolean }
    const [prices, setPrices] = useState({ ADULT: 800, CHILD: 500 });

    useEffect(() => {
        // Fetch Ticket Prices
        api.get('/public/pricing/tickets', { params: { slotId: slot?.id } })
            .then(res => setPrices(res.data))
            .catch(err => console.error('Error fetching ticket prices:', err));

        // Fetch Add-on Prices and Details
        api.get('/public/pricing/addons')
            .then(res => {
                setAvailableAddons(res.data);
                // Initialize selected addons map
                const initial = {};
                res.data.forEach(a => initial[a.id] = false);
                setSelectedAddons(initial);
            })
            .catch(err => console.error('Error fetching add-ons:', err));
    }, []);

    const adultPrice = prices.ADULT || 800;
    const childPrice = prices.CHILD || 500;

    const totalPersons = adults + children;
    const subtotal = (adults * adultPrice) + (children * childPrice);
    
    // Calculate addon total dynamically
    const addonTotal = availableAddons.reduce((sum, addon) => {
        if (selectedAddons[addon.id]) {
            return sum + (addon.type === 'PER_PERSON' ? addon.price * totalPersons : addon.price);
        }
        return sum;
    }, 0);

    const total = subtotal + addonTotal;

    const toggleAddon = (id) => {
        setSelectedAddons(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const formatAmPm = (timeStr) => {
        if (!timeStr) return '';
        let [h, m] = timeStr.split(':');
        h = parseInt(h);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hh = h % 12 || 12;
        return `${String(hh).padStart(2, '0')}:${m} ${ampm}`;
    };

    const handleContinue = () => {
        navigate('/book/details', {
            state: { 
                date, 
                slot, 
                adults, 
                children, 
                selectedAddons, // Map of ID -> boolean
                availableAddons, // Full list for details
                total,
                adultPrice: prices.ADULT,
                childPrice: prices.CHILD
            }
        });
    };

    const displayDate = date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select a date';

    return (
        <div className="bg-background text-on-surface min-h-screen flex flex-col">
            {/* TopNavBar */}
            <nav className="fixed top-0 z-50 flex w-full items-center justify-between bg-stone-50/80 px-4 py-4 font-public-sans tracking-tight text-on-surface shadow-[0px_12px_32px_rgba(44,52,51,0.06)] backdrop-blur-md sm:px-6 lg:px-12 dark:bg-stone-950/80">
                <Link to="/" className="text-lg font-bold tracking-tighter text-emerald-900 sm:text-2xl dark:text-emerald-50">
                    Civic Naturalist Zoo
                </Link>
                <div className="hidden md:flex items-center space-x-8">
                    <a className="text-stone-600 dark:text-stone-400 hover:text-emerald-700 transition-colors" href="#">Exhibits</a>
                    <a className="text-stone-600 dark:text-stone-400 hover:text-emerald-700 transition-colors" href="#">Conservation</a>
                    <a className="text-emerald-800 dark:text-emerald-400 font-semibold border-b-2 border-emerald-800" href="#">Tickets</a>
                    <a className="text-stone-600 dark:text-stone-400 hover:text-emerald-700 transition-colors" href="#">Visit</a>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
                    <Link to="/login" className="text-sm text-stone-600 transition-colors hover:text-emerald-700 dark:text-stone-400 sm:text-base">Sign In</Link>
                    <button className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-all duration-200 hover:bg-primary-dim sm:block sm:px-6">
                        Support Us
                    </button>
                </div>
            </nav>

            <main className="flex-grow px-4 pb-12 pt-20 sm:px-6 lg:px-12">
                {/* Progress Indicator */}
                <div className="max-w-7xl mx-auto mb-8">
                    <div className="flex items-center justify-between max-w-xl mx-auto">
                        <div className="flex flex-col items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">1</span>
                            <span className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium">Date</span>
                        </div>
                        <div className="h-[2px] flex-grow bg-primary-container mx-4"></div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">2</span>
                            <span className="text-[0.625rem] uppercase tracking-widest text-primary font-bold">Tickets</span>
                        </div>
                        <div className="h-[2px] flex-grow bg-surface-container-high mx-4"></div>
                        <div className="flex flex-col items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold text-sm">3</span>
                            <span className="text-[0.625rem] uppercase tracking-widest text-on-surface-variant font-medium">Payment</span>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Selection Content */}
                    <div className="lg:col-span-8 space-y-12">
                        <section>
                            <h1 className="mb-2 text-3xl font-bold tracking-tighter text-on-surface md:text-4xl">Select Your Tickets</h1>
                            <p className="text-on-surface-variant max-w-2xl">Step 2: Choose the admission types for your party. All tickets include access to our conservation exhibits and botanical walk.</p>
                        </section>

                        {/* Ticket Counters */}
                        <div className="space-y-4">
                            <div className="group flex flex-col justify-between gap-6 rounded-xl bg-surface-container-low p-6 transition-colors hover:bg-surface-container sm:flex-row sm:items-center sm:p-8">
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight text-on-surface">Adult</h3>
                                    <p className="text-sm text-on-surface-variant">Ages 13 and above</p>
                                    <p className="mt-2 font-bold text-primary">₹{adultPrice}.00</p>
                                </div>
                                <div className="flex items-center justify-between gap-4 sm:justify-start sm:gap-6">
                                    <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary-container hover:border-primary-container transition-all text-on-surface">
                                        <span className="material-symbols-outlined">remove</span>
                                    </button>
                                    <span className="text-2xl font-bold w-6 text-center">{adults}</span>
                                    <button onClick={() => setAdults(Math.min(10, adults + 1))} className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary-container hover:border-primary-container transition-all text-on-surface">
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                </div>
                            </div>
                            <div className="group flex flex-col justify-between gap-6 rounded-xl bg-surface-container-low p-6 transition-colors hover:bg-surface-container sm:flex-row sm:items-center sm:p-8">
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight text-on-surface">Child</h3>
                                    <p className="text-sm text-on-surface-variant">Ages 3 to 12. Under 3 are free.</p>
                                    <p className="mt-2 font-bold text-primary">₹{childPrice}.00</p>
                                </div>
                                <div className="flex items-center justify-between gap-4 sm:justify-start sm:gap-6">
                                    <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary-container hover:border-primary-container transition-all text-on-surface">
                                        <span className="material-symbols-outlined">remove</span>
                                    </button>
                                    <span className="text-2xl font-bold w-6 text-center">{children}</span>
                                    <button onClick={() => setChildren(Math.min(10, children + 1))} className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary-container hover:border-primary-container transition-all text-on-surface">
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Enhancements Section */}
                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold tracking-tight text-on-surface">Enhance Your Visit</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {availableAddons.map(addon => (
                                    <div 
                                        key={addon.id} 
                                        className={`bg-surface-container-lowest overflow-hidden group rounded-2xl shadow-sm border transition-all cursor-pointer ${selectedAddons[addon.id] ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/20 hover:border-primary/50'}`}
                                        onClick={() => toggleAddon(addon.id)}
                                    >
                                        <div className="h-36 w-full relative overflow-hidden">
                                            {addon.imageUrl ? (
                                                <img alt={addon.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={addon.imageUrl} />
                                            ) : (
                                                <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-on-surface-variant/30">
                                                    <span className="material-symbols-outlined text-4xl">image</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                            <div className="absolute bottom-4 left-4 text-white">
                                                <div className="font-bold text-lg leading-tight">{addon.name}</div>
                                                <div className="text-[10px] uppercase tracking-widest font-black opacity-80">{addon.type === 'PER_PERSON' ? 'Per Person' : 'Per Booking'}</div>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <p className="text-sm text-on-surface-variant line-clamp-2 min-h-[40px]">{addon.description || 'Additional service to enhance your experience.'}</p>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-primary">₹{addon.price}.00</span>
                                                {selectedAddons[addon.id] ? (
                                                    <button className="px-5 py-2 bg-primary text-on-primary text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-2 shadow-lg shadow-primary/20">
                                                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                                        Selected
                                                    </button>
                                                ) : (
                                                    <button className="px-5 py-2 bg-primary-container text-on-primary-container text-xs font-bold uppercase tracking-widest rounded-full hover:bg-primary hover:text-on-primary transition-all">Add</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {availableAddons.length === 0 && (
                                    <div className="col-span-2 py-12 text-center text-on-surface-variant italic border-2 border-dashed border-outline-variant/20 rounded-2xl">
                                        No enhancement services currently available.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Sidebar Booking Summary */}
                    <aside className="lg:col-span-4">
                        <div className="lg:sticky lg:top-24 bg-surface-container-lowest p-6 sm:p-8 rounded-xl shadow-[0px_12px_32px_rgba(44,52,51,0.06)] space-y-8 border border-outline-variant/10">
                            <div>
                                <h2 className="text-xs uppercase tracking-[0.15em] text-on-surface-variant font-bold mb-6">Booking Summary</h2>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-on-surface">General Admission</p>
                                            <p className="text-xs text-on-surface-variant">{displayDate} • {formatAmPm(slot?.startTime)}</p>
                                        </div>
                                        <button className="text-primary hover:underline text-xs font-bold uppercase" onClick={() => navigate(-1)}>Change</button>
                                    </div>

                                    <div className="space-y-3 pt-6 border-t border-surface-container-high">
                                        {adults > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-on-surface-variant">Adult (x{adults})</span>
                                                <span className="font-medium text-on-surface">₹{adults * adultPrice}.00</span>
                                            </div>
                                        )}
                                        {children > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-on-surface-variant">Child (x{children})</span>
                                                <span className="font-medium text-on-surface">₹{children * childPrice}.00</span>
                                            </div>
                                        )}
                                        {availableAddons.map(addon => selectedAddons[addon.id] && (
                                            <div key={addon.id} className="flex justify-between text-sm">
                                                <span className="text-on-surface-variant">{addon.name} {addon.type === 'PER_PERSON' ? `(x${totalPersons})` : ''}</span>
                                                <span className="font-medium text-on-surface">₹{addon.type === 'PER_PERSON' ? addon.price * totalPersons : addon.price}.00</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-6 border-t border-surface-container-high space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-on-surface">Total</span>
                                            <span className="text-3xl font-extrabold tracking-tighter text-primary">₹{total}.00</span>
                                        </div>
                                        <p className="text-[0.625rem] text-on-surface-variant text-center leading-relaxed">
                                            Prices include all local taxes and conservation levies. Non-refundable but transferable.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleContinue} className="w-full py-5 bg-primary text-on-primary font-bold rounded-lg flex items-center justify-center gap-3 group transition-all hover:bg-primary-dim">
                                Continue
                                <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
                            </button>
                            <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-lg justify-center">
                                <span className="material-symbols-outlined text-primary">verified_user</span>
                                <span className="text-[0.625rem] text-on-surface-variant font-medium uppercase tracking-wider">Secure SSL Checkout</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Footer Component Mapping from JSON */}
            <footer className="bg-stone-100 dark:bg-stone-900 w-full border-t border-stone-200/50 dark:border-stone-800/50">
                <div className="flex flex-col md:flex-row justify-between items-center px-12 py-8 w-full">
                    <div className="mb-4 md:mb-0">
                        <span className="text-lg font-bold text-emerald-900 font-headline tracking-tighter">Civic Naturalist Zoo</span>
                    </div>
                    <div className="flex gap-8 mb-4 md:mb-0">
                        <a className="font-public-sans text-sm uppercase tracking-widest text-stone-500 dark:text-stone-400 hover:text-emerald-600 transition-all opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
                        <a className="font-public-sans text-sm uppercase tracking-widest text-stone-500 dark:text-stone-400 hover:text-emerald-600 transition-all opacity-80 hover:opacity-100" href="#">Accessibility</a>
                        <a className="font-public-sans text-sm uppercase tracking-widest text-stone-500 dark:text-stone-400 hover:text-emerald-600 transition-all opacity-80 hover:opacity-100" href="#">Terms of Service</a>
                        <a className="font-public-sans text-sm uppercase tracking-widest text-stone-500 dark:text-stone-400 hover:text-emerald-600 transition-all opacity-80 hover:opacity-100" href="#">Contact Us</a>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-stone-400">
                        © 2024 Civic Naturalist Botanical Gardens & Zoo. A Sanctuary for Biodiversity.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default TicketSelectionPage;
