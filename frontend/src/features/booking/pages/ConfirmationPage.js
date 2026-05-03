import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './BookingFlow.css';

const ConfirmationPage = () => {
    const location = useLocation();
    const state = location.state || {};

    const formatAmPm = (timeStr) => {
        if (!timeStr) return '';
        let [h, m] = timeStr.split(':');
        h = parseInt(h);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hh = h % 12 || 12;
        return `${String(hh).padStart(2, '0')}:${m} ${ampm}`;
    };

    const displayDate = state.date ? new Date(state.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

    // Auto-scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
        console.group('[ConfirmationPage] Booking Confirmed');
        console.log('Booking Details:', state);
        console.groupEnd();
    }, [state]);

    const handleDownloadPdf = () => {
        if (state.pdfUrl) {
            window.open(`http://localhost:8080${state.pdfUrl}`, '_blank');
        } else {
            alert('PDF ticket is being generated. Please check your email.');
        }
    };

    return (
        <div className="bg-background text-on-surface min-h-screen pb-24 font-public-sans">
            {/* TopAppBar Component (Transactional/Success Style) */}
            <header className="docked full-width top-0 sticky z-50 flex h-auto w-full flex-wrap items-center gap-3 bg-[#f9f9f8] px-4 py-4 sm:h-16 sm:px-6 dark:bg-zinc-950">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#466553] dark:text-[#5d856d]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <h1 className="font-public-sans tracking-tight font-bold text-on-surface text-lg">Booking Confirmed</h1>
                </div>
                <div className="ml-auto">
                    <Link to="/" className="text-sm font-bold uppercase tracking-widest text-primary hover:text-primary-dim">Back to Home</Link>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 pt-4 pb-12 sm:px-6">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[11px] uppercase tracking-wider font-bold text-primary">Confirmation</span>
                        <span className="text-[11px] uppercase tracking-wider font-bold text-primary">100% Complete</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-full"></div>
                    </div>
                </div>

                {/* Success Message Cluster */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-16">
                    <div className="md:col-span-7">
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-on-surface mb-4">Booking Successful!</h2>
                        <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
                            Thank you for supporting our conservation efforts. Your tickets have been issued and a confirmation email has been sent to your registered address.
                        </p>
                        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                            <div>
                                <span className="block text-[11px] uppercase tracking-wider font-bold text-outline mb-1">Booking ID</span>
                                <span className="text-xl font-bold font-mono tracking-tight text-emerald-900">#{state.bookingId || 'PENDING'}</span>
                            </div>
                            <div>
                                <span className="block text-[11px] uppercase tracking-wider font-bold text-outline mb-1">Ticket Count</span>
                                <span className="text-xl font-bold">{state.adults || 0} Adults, {state.children || 0} Child</span>
                            </div>
                            <div className="sm:col-span-2">
                                <span className="block text-[11px] uppercase tracking-wider font-bold text-outline mb-1">Selected Date &amp; Time</span>
                                <span className="text-xl font-bold">{displayDate}, {formatAmPm(state.slot?.startTime)} — {formatAmPm(state.slot?.endTime)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Ticket Card (Asymmetric Layout) */}
                    <div className="md:col-span-5">
                        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_12px_32px_rgba(44,52,51,0.06)] relative overflow-hidden">
                            {/* Ticket Header Tonal Shift */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-container/30 -mr-16 -mt-16 rounded-full blur-3xl"></div>
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-full flex justify-between items-center mb-8">
                                    <span className="font-extrabold text-primary tracking-tighter uppercase text-xs">Admission Pass</span>
                                    <span className="material-symbols-outlined text-outline-variant">qr_code_2</span>
                                </div>
                                {/* QR Code Area */}
                                    <div className="mb-8 flex aspect-square w-full max-w-[200px] items-center justify-center rounded-xl border border-outline-variant/10 bg-white p-4 shadow-inner">
                                    <div className="w-full h-full bg-surface-container-highest flex items-center justify-center relative">
                                        <img alt="Scan-ready QR code for entry" className="w-full h-full mix-blend-multiply opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZ6yxk6NJNoVHl4r00Ap0smlaURKSM0W-sW-1343p-oei8siOZYqxD22FgFxNU5VBHvsZyGOWlWp7v8oVR5opxwpEL5tOAURpmiKiY7hSyRqoimdlUOqIZuI25OkKIijHMWlj9Nz6OmCyFnciNlbViciObTDLJ6UOF_9k3t9aYkc-3KgetDi--44auvW0lgRR7ACWK5hfKmaJOrKhw2ptB2Zvkv5eDTywG0RQ-Y0YA6ER0Vo5rbYfyU6smZJbJrYwl-BP9BXReZ3I" />
                                    </div>
                                </div>

                                <div className="text-center w-full">
                                    <p className="text-[11px] uppercase tracking-widest font-bold text-outline-variant mb-4">Present at Main Gate</p>
                                    <div className="flex flex-col gap-3">
                                        <button onClick={handleDownloadPdf} className="w-full bg-primary text-on-primary py-3.5 px-6 rounded-lg font-bold text-sm flex items-center justify-center gap-2 active:scale-95 duration-150 transition-all">
                                            <span className="material-symbols-outlined text-[20px]">download</span>
                                            Download PDF
                                        </button>
                                        <button className="w-full bg-surface-container-high text-on-primary-container py-3.5 px-6 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-surface-container-highest active:scale-95 duration-150 transition-all">
                                            <span className="material-symbols-outlined text-[20px]">mail</span>
                                            Send to Email
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preparation Tips (Editorial Layout) */}
                <section className="mt-12 pt-10 border-t border-outline-variant/15">
                    <h3 className="text-2xl font-extrabold tracking-tight mb-8">Preparing for your visit</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-surface-container-low p-6 rounded-xl">
                            <span className="material-symbols-outlined text-tertiary mb-4">forest</span>
                            <h4 className="font-bold mb-2">Sustainable Travel</h4>
                            <p className="text-sm text-on-surface-variant leading-relaxed">Consider using the Greenway Shuttle. Present your ticket for a 20% discount on the fare.</p>
                        </div>
                        <div className="bg-surface-container-low p-6 rounded-xl">
                            <span className="material-symbols-outlined text-tertiary mb-4">wb_sunny</span>
                            <h4 className="font-bold mb-2">Weather Ready</h4>
                            <p className="text-sm text-on-surface-variant leading-relaxed">Outdoor exhibits are fully open. We recommend comfortable walking shoes and hydration.</p>
                        </div>
                        <div className="bg-surface-container-low p-6 rounded-xl">
                            <span className="material-symbols-outlined text-tertiary mb-4">map</span>
                            <h4 className="font-bold mb-2">Digital Guide</h4>
                            <p className="text-sm text-on-surface-variant leading-relaxed">Download our interactive sanctuary map to find scheduled feeding times and exhibit details.</p>
                        </div>
                    </div>
                </section>

                {/* Banner Image (Asymmetric Bleed Effect) */}
                <div className="mt-10 h-44 w-full rounded-2xl overflow-hidden relative group">
                    <img alt="Lion in lush greenery" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHGex359T7nXeZnZdSDo8pTSLKxF_CBQR609iSXH26TYYQhQwtzqE5sjdATjFJmEIsudloTOh2O1ygr2bu4sBfLcB-J7z1R2lP1ZFXX51FWPlHjg4iFNc4KTiK3LV-FhVaD2UItYlvMM5I6DtXujcdUNdmQqDkreVzCKt-lzo3iyrXzkT4Vx_vi2g-SwqsizD_iDYLCM5FVRjRtxUbSfvD8d_fRbWb5yVn1-LtsjJAI6HuJIWtvI5DlhiW0HgYoySCgHuYigf1Psw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                        <p className="text-white font-bold text-xl tracking-tight max-w-xs">We can't wait to see you at the Sanctuary.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ConfirmationPage;
