import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../core/services/api';
import './BookingFlow.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const DateTimePage = () => {
    const navigate = useNavigate();
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [adultPrice, setAdultPrice] = useState(800);

    useEffect(() => {
        api.get('/public/pricing/tickets')
            .then(res => setAdultPrice(res.data.ADULT || 800))
            .catch(err => console.error('Failed to fetch base price:', err));
    }, []);

    const daysInMonth = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const total = new Date(currentYear, currentMonth + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= total; i++) days.push(i);
        return days;
    }, [currentMonth, currentYear]);

    useEffect(() => {
        if (selectedDate) {
            fetchSlots();
        }
    }, [selectedDate, currentMonth, currentYear]);

    const fetchSlots = async () => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
        setLoading(true);
        setError(null);
        console.log(`[DateTimePage] Fetching slots for date: ${dateStr}`);
        
        try {
            const res = await api.get('/slots/available', { params: { date: dateStr } });
            console.log('[DateTimePage] Slots fetched successfully:', res.data);
            setSlots(res.data);
        } catch (err) {
            console.error('[DateTimePage] Failed to fetch slots:', err);
            setError('Unable to load entry windows. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isDateValid = (day) => {
        if (!day) return false;
        const date = new Date(currentYear, currentMonth, day);
        const normalize = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
        return normalize(date) >= normalize(today);
    };

    const formatSelectedDate = () => {
        if (!selectedDate) return '';
        return `${MONTHS[currentMonth].substring(0, 3)} ${selectedDate}, ${currentYear}`;
    };

    const handleContinue = () => {
        if (selectedDate && selectedSlot) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
            console.log('[DateTimePage] Proceeding to tickets with:', { date: dateStr, slot: selectedSlot });
            navigate('/book/tickets', { state: { date: dateStr, slot: selectedSlot } });
        }
    };

    const formatAmPm = (timeStr) => {
        if (!timeStr) return '';
        let [h, m] = timeStr.split(':');
        h = parseInt(h);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hh = h % 12 || 12;
        return `${String(hh).padStart(2, '0')}:${m} ${ampm}`;
    };

    return (
        <div className="bg-background text-on-surface min-h-screen flex flex-col">
            {/* TopNavBar */}
            <nav className="fixed top-0 w-full z-50 flex items-center justify-between bg-stone-50/80 px-4 py-4 font-public-sans tracking-tight text-on-surface shadow-[0px_12px_32px_rgba(44,52,51,0.06)] backdrop-blur-md sm:px-6 lg:px-12 dark:bg-stone-950/80">
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
                    <button className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-all duration-200 ease-in-out hover:bg-primary-dim sm:block sm:px-6">
                        Support Us
                    </button>
                </div>
            </nav>

            {/* Main Content Canvas */}
            <main className="mx-auto w-full max-w-7xl flex-grow px-4 pb-10 pt-20 sm:px-6 lg:px-12">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="mx-auto mb-4 flex max-w-2xl items-center justify-between">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">1</div>
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">Schedule</span>
                        </div>
                        <div className="flex-grow h-[2px] bg-surface-container-highest mx-4 mb-6"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold">2</div>
                            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tickets</span>
                        </div>
                        <div className="flex-grow h-[2px] bg-surface-container-highest mx-4 mb-6"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold">3</div>
                            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Review</span>
                        </div>
                    </div>
                    <h1 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">Plan Your Expedition</h1>
                    <p className="text-on-surface-variant text-center mt-1 max-w-xl mx-auto text-sm">Select your preferred date and entry window for a curated experience.</p>
                </div>

                <div className="asymmetric-grid">
                    {/* Left: Calendar Section */}
                    <section className="space-y-8">
                        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_12px_32px_rgba(44,52,51,0.06)]">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold tracking-tight">{MONTHS[currentMonth]} {currentYear}</h2>
                                <div className="flex gap-4">
                                    <button
                                        disabled={currentYear <= today.getFullYear() && currentMonth <= today.getMonth()}
                                        onClick={() => {
                                            if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
                                            else setCurrentMonth(currentMonth - 1);
                                        }}
                                        className={`p-2 hover:bg-surface-container rounded-lg transition-colors ${currentYear <= today.getFullYear() && currentMonth <= today.getMonth() ? 'opacity-20 cursor-not-allowed' : ''}`}>
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
                                            else setCurrentMonth(currentMonth + 1);
                                        }}
                                        className="p-2 hover:bg-surface-container rounded-lg transition-colors">
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-2">
                                {/* Days Header */}
                                {DAYS.map(d => (
                                    <div key={d} className="text-center py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{d}</div>
                                ))}

                                {daysInMonth.map((day, i) => {
                                    if (!day) return <div key={i} className="h-12 bg-surface-dim opacity-40 rounded flex items-center justify-center text-on-surface-variant"></div>;
                                    const isValid = isDateValid(day);
                                    const isSelected = selectedDate === day;

                                    if (!isValid) {
                                        return (
                                            <div key={i} className="h-12 bg-surface-dim/20 opacity-20 rounded flex items-center justify-center text-on-surface-variant/10 text-sm">
                                                {/* Don't show the number for past dates to emphasize they are unavailable */}
                                            </div>
                                        );
                                    }

                                    if (isSelected) {
                                        return (
                                            <div key={i} onClick={() => setSelectedDate(day)} className="h-12 bg-primary text-on-primary rounded flex flex-col items-center justify-center cursor-pointer relative shadow-lg">
                                                <span className="font-bold text-sm">{day}</span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={i} onClick={() => setSelectedDate(day)} className="h-12 bg-surface-container-low hover:bg-surface-container transition-colors rounded flex flex-col items-center justify-center cursor-pointer">
                                            <span className="font-bold text-sm">{day}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Naturalist Tips (Bento-lite) */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="bg-tertiary-container p-6 rounded-xl flex gap-4 items-start">
                                <div className="bg-surface-container-lowest p-2 rounded-lg">
                                    <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>light_mode</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-on-tertiary-container text-sm">Early Bird Advantage</h4>
                                    <p className="text-[10px] text-on-tertiary-fixed-variant mt-1">Animals are most active before 10:00 AM. Perfect for photography.</p>
                                </div>
                            </div>
                            <div className="bg-surface-container p-6 rounded-xl flex gap-4 items-start overflow-hidden relative">
                                <div className="relative z-10">
                                    <h4 className="font-bold text-sm">Conservation Spotlight</h4>
                                    <p className="text-[10px] text-on-surface-variant mt-1">Visit the Aviary at noon for the rare orchid pollination display.</p>
                                </div>
                                <div className="absolute right-[-10%] bottom-[-20%] w-20 h-20 opacity-20 transform rotate-12">
                                    <span className="material-symbols-outlined text-[60px]" style={{ fontVariationSettings: "'FILL' 1" }}>potted_plant</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Right: Entry Windows */}
                    <section className="flex flex-col gap-8">
                        <div className="flex h-full flex-col rounded-xl border border-outline-variant/10 bg-surface-container-low p-6 sm:p-8">
                            <h3 className="text-lg font-bold tracking-tight mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">schedule</span>
                                Available Entry Windows
                            </h3>
                            
                            {error && (
                                <div className="bg-error-container/20 text-error p-4 rounded-lg mb-4 text-xs font-bold border border-error/20">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4 flex-grow overflow-y-auto pr-2 min-h-[300px]">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Syncing with Sanctuary...</span>
                                    </div>
                                ) : slots.length > 0 ? (
                                    slots.map(slot => {
                                        const available = slot.availableCapacity;
                                        const isSoldOut = available <= 0 || !slot.isActive;
                                        const isSelected = selectedSlot?.id === slot.id;

                                        if (isSoldOut) {
                                            return (
                                                <div key={slot.id} className="bg-surface-container-lowest p-5 rounded-lg border-l-4 border-transparent opacity-60 flex items-center justify-between">
                                                    <div>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-error">Sold Out / Inactive</span>
                                                        <p className="text-xl font-bold text-on-surface italic line-through">{formatAmPm(slot.startTime)} — {formatAmPm(slot.endTime)}</p>
                                                        <p className="text-[10px] text-error-container mt-1">This slot is currently full or unavailable.</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-error">block</span>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div
                                                key={slot.id}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={`bg-surface-container-lowest p-5 rounded-lg border-l-4 flex items-center justify-between group cursor-pointer transition-all ${isSelected ? 'border-primary shadow-lg ring-1 ring-primary/10' : 'border-transparent hover:bg-surface-container'}`}
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>General Admission</span>
                                                        {available < 10 && <span className="bg-error/10 text-error text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter animate-pulse">Filling Fast</span>}
                                                    </div>
                                                    <p className="text-xl font-bold text-on-surface">{formatAmPm(slot.startTime)} — {formatAmPm(slot.endTime)}</p>
                                                    <p className="text-[10px] text-on-surface-variant mt-1">{available} spots remaining today</p>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary' : 'border-outline-variant'}`}>
                                                    {isSelected && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : selectedDate ? (
                                    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                                        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">event_busy</span>
                                        <p className="font-bold text-on-surface">No entry windows found</p>
                                        <p className="text-xs text-on-surface-variant mt-1">Try selecting a different date for your visit.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                                        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">calendar_month</span>
                                        <p className="font-bold text-on-surface">Select a date</p>
                                        <p className="text-xs text-on-surface-variant mt-1">Pick a day on the calendar to see entry windows.</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-8 border-t border-outline-variant/20">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Selected Visit</p>
                                        <p className="font-bold">{selectedDate ? formatSelectedDate() : 'Select a Date'} {selectedSlot ? `• ${formatAmPm(selectedSlot.startTime)}` : ''}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Starting From</p>
                                        <p className="text-xl font-bold text-primary">₹{adultPrice}.00</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleContinue}
                                    disabled={!selectedDate || !selectedSlot}
                                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 ${selectedDate && selectedSlot ? 'bg-primary text-on-primary hover:bg-primary-dim shadow-xl shadow-primary/20' : 'bg-surface-dim text-on-surface-variant cursor-not-allowed opacity-50'}`}
                                >
                                    Continue to Tickets
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </section>
                </div>


            </main>

            {/* Footer */}
            <footer className="w-full border-t border-stone-200/50 dark:border-stone-800/50 bg-stone-100 dark:bg-stone-900 flex flex-col md:flex-row justify-between items-center px-12 py-8 font-public-sans text-sm uppercase tracking-widest text-emerald-900 dark:text-emerald-50">
                <div className="flex flex-col gap-2">
                    <span className="text-lg font-bold text-emerald-900">Civic Naturalist</span>
                    <span className="text-[10px] opacity-60 normal-case tracking-normal">© 2024 Civic Naturalist Botanical Gardens & Zoo. A Sanctuary for Biodiversity.</span>
                </div>
                <div className="flex gap-8 mt-6 md:mt-0 flex-wrap">
                    <a className="text-stone-500 dark:text-stone-400 hover:text-emerald-600 transition-all opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
                    <a className="text-stone-500 dark:text-stone-400 hover:text-emerald-600 transition-all opacity-80 hover:opacity-100" href="#">Accessibility</a>
                    <a className="text-stone-500 dark:text-stone-400 hover:text-emerald-600 transition-all opacity-80 hover:opacity-100" href="#">Terms of Service</a>
                    <a className="text-stone-500 dark:text-stone-400 hover:text-emerald-600 transition-all opacity-80 hover:opacity-100" href="#">Contact Us</a>
                </div>
            </footer>
        </div>
    );
};

export default DateTimePage;
