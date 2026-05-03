import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../../../core/services/api';
import './BookingFlow.css';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const bookingState = location.state || {};
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [prices, setPrices] = useState({ 
        ADULT: bookingState.adultPrice || 800, 
        CHILD: bookingState.childPrice || 500 
    });
    const [addonMap, setAddonMap] = useState({});
    const [cardData, setCardData] = useState({
        number: '',
        expiry: '',
        cvc: '',
        name: ''
    });

    useEffect(() => {
        // Fetch Ticket Prices if not provided
        if (!bookingState.adultPrice) {
            api.get('/public/pricing/tickets')
                .then(res => setPrices(res.data))
                .catch(err => console.error('Error fetching prices:', err));
        }

        // Fetch Add-ons to get correct IDs
        api.get('/public/pricing/addons')
            .then(res => {
                const map = {};
                res.data.forEach(a => map[a.name] = a.id);
                setAddonMap(map);
            })
            .catch(err => console.error('Error fetching add-ons:', err));
    }, [bookingState.adultPrice]);

    // Calculate total including the conservation levy
    // Use the dynamic total from state or recalculate if missing
    const subtotal = (bookingState.adults * (prices.ADULT || 800)) + (bookingState.children * (prices.CHILD || 500));
    const finalTotal = (bookingState.total || subtotal) + 100;

    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Numeric only
        if (value.length > 16) value = value.slice(0, 16);
        
        // Format with spaces: 0000 0000 0000 0000
        const formatted = value.match(/.{1,4}/g)?.join(' ') || '';
        setCardData({ ...cardData, number: formatted });
    };

    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Numeric only
        if (value.length > 4) value = value.slice(0, 4);
        
        // Format as MM/YY
        if (value.length >= 3) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        setCardData({ ...cardData, expiry: value });
    };

    const handleCVCChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Numeric only
        if (value.length > 4) value = value.slice(0, 4);
        setCardData({ ...cardData, cvc: value });
    };

    useEffect(() => {
        // Load Razorpay SDK
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        }
    }, []);

    const handlePayment = async () => {
        setProcessing(true);
        setError(null);
        console.group('[PaymentPage] Initiating Booking Process');
        
        try {
            // 1. Initiate Booking
            const addOns = [];
            const selectedAddonIds = Object.keys(bookingState.selectedAddons || {}).filter(id => bookingState.selectedAddons[id]);
            
            selectedAddonIds.forEach(id => {
                const addon = (bookingState.availableAddons || []).find(a => String(a.id) === String(id));
                if (addon) {
                    addOns.push({ 
                        addOnId: parseInt(id), 
                        quantity: addon.type === 'PER_PERSON' ? (bookingState.adults + bookingState.children) : 1 
                    });
                }
            });

            const initiatePayload = {
                slotId: bookingState.slot?.id,
                adultTickets: bookingState.adults || 0,
                childTickets: bookingState.children || 0,
                addOns: addOns,
                guestFullName: bookingState.userDetails?.fullName,
                guestEmail: bookingState.userDetails?.email,
                guestMobileNumber: bookingState.userDetails?.mobileNumber
            };

            const initiateRes = await api.post('/bookings/initiate', initiatePayload);
            const bookingData = initiateRes.data;
            const bookingId = bookingData.id;
            const razorpayOrderId = bookingData.razorpayOrderId;
            
            console.log('[PaymentPage] Booking initiated. Order ID:', razorpayOrderId);

            /* 
            // 2. Razorpay Checkout (BYPASSED FOR DEVELOPMENT)
            if (!window.Razorpay) {
                setError("Payment SDK failed to load. Refresh and try again.");
                setProcessing(false);
                return;
            }

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_SfGiUOcNjRoxdo',
                amount: Math.round(bookingData.totalAmount * 100),
                currency: "INR",
                name: "Civic Naturalist Zoo",
                description: "Explorer Day Pass Booking",
                order_id: razorpayOrderId,
                handler: async function (response) {
                    // ... verification logic ...
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
            */

            // Bypassing payment: navigate directly to confirmation
            console.log('[PaymentPage] Bypassing Razorpay payment for development');
            navigate('/booking/confirmation', {
                state: {
                    ...bookingState,
                    bookingId: bookingId,
                    pdfUrl: null // PDF might not be generated yet without backend payment confirmation
                }
            });

        } catch (err) {
            console.error('[PaymentPage] Checkout failed:', err);
            setError(err.response?.data?.message || err.response?.data || 'Failed to initiate booking. Please try again.');
            setProcessing(false);
        } finally {
            console.groupEnd();
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

    const displayDate = bookingState.date ? new Date(bookingState.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

    return (
        <div className="bg-background text-on-surface min-h-screen font-public-sans">
            {/* TopNavBar */}
            <header className="fixed top-0 w-full z-50 bg-stone-50/80 backdrop-blur-md shadow-[0px_12px_32px_rgba(44,52,51,0.06)] dark:bg-stone-950/80">
                <div className="mx-auto flex max-w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-12">
                    <Link to="/" className="text-lg font-bold tracking-tighter text-emerald-900 sm:text-2xl dark:text-emerald-50">Civic Naturalist Zoo</Link>
                    <nav className="hidden md:flex items-center gap-8">
                        <a className="text-stone-600 dark:text-stone-400 hover:text-emerald-700 tracking-tight transition-colors" href="#">Exhibits</a>
                        <a className="text-stone-600 dark:text-stone-400 hover:text-emerald-700 tracking-tight transition-colors" href="#">Conservation</a>
                        <a className="text-emerald-800 dark:text-emerald-400 font-semibold border-b-2 border-emerald-800 tracking-tight" href="#">Tickets</a>
                        <a className="text-stone-600 dark:text-stone-400 hover:text-emerald-700 tracking-tight transition-colors" href="#">Visit</a>
                    </nav>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link to="/login" className="px-3 py-2 text-sm font-medium text-emerald-900 transition-colors hover:bg-emerald-50/50 sm:px-5 dark:text-emerald-50">Sign In</Link>
                        <button className="hidden rounded-lg bg-primary px-5 py-2 font-semibold text-on-primary transition-all hover:opacity-90 sm:block">Support Us</button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 md:px-12">
                {error && (
                    <div className="mb-8 p-6 bg-error-container/20 border-2 border-error/20 rounded-xl flex items-start gap-4 animate-in slide-in-from-top duration-300">
                        <span className="material-symbols-outlined text-error">warning</span>
                        <div className="flex-1">
                            <h4 className="font-bold text-error uppercase tracking-widest text-[10px] mb-1">Transaction Execution Failed</h4>
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="text-error/60 hover:text-error transition-colors">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left Column: Checkout Actions */}
                    <div className="lg:col-span-7 space-y-12">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold tracking-tight text-on-surface md:text-4xl">Complete Your Booking</h1>
                            <p className="text-on-surface-variant max-w-md">Secure your passage to the sanctuary. Your contribution directly supports global biodiversity conservation efforts.</p>
                        </div>

                        {/* Payment Selection Simplified */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold tracking-tight">Payment Method</h2>
                                <div className="flex items-center gap-2 text-emerald-800 bg-primary-container/30 px-3 py-1 rounded-full">
                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                                    <span className="text-xs font-bold uppercase tracking-widest">SSL Secured</span>
                                </div>
                            </div>

                            <div className="bg-surface-container-lowest p-8 rounded-xl border-2 border-primary/10 shadow-sm space-y-4">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-2xl">payments</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Razorpay Secure Checkout</h3>
                                        <p className="text-sm text-on-surface-variant">Pay securely via Cards, UPI, NetBanking, or Wallets.</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-outline-variant/10 flex flex-wrap gap-4 opacity-70">
                                    {/* Mock logos or icons for payment methods */}
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-md">
                                        <span className="material-symbols-outlined text-sm">credit_card</span>
                                        <span className="text-xs font-bold">Cards</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-md">
                                        <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                                        <span className="text-xs font-bold">UPI / Wallets</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-md">
                                        <span className="material-symbols-outlined text-sm">account_balance</span>
                                        <span className="text-xs font-bold">NetBanking</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Cancellation Policy */}
                        <section className="bg-surface-container-low p-8 rounded-xl space-y-4">
                            <div className="flex items-center gap-3 text-tertiary">
                                <span className="material-symbols-outlined">info</span>
                                <h3 className="font-bold uppercase tracking-widest text-sm">Cancellation Policy</h3>
                            </div>
                            <p className="text-on-surface-variant text-sm leading-relaxed">
                                Full refunds are available for cancellations made at least 48 hours prior to the scheduled visit. Cancellations within 48 hours are eligible for a 50% credit toward a future visit. As a civic institution, processing fees support our local ecology programs.
                            </p>
                        </section>
                    </div>

                    {/* Right Column: Booking Summary Card */}
                    <div className="lg:col-span-5 sticky top-32">
                        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_12px_32px_rgba(44,52,51,0.06)] flex flex-col border border-outline-variant/10">
                            <div className="relative h-48 w-full overflow-hidden">
                                <img alt="Lush botanical garden" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvegZDwppW59gYj60y5upwV9h6a2DdyGRhN-hbG9Mgi_hzxJQ2Xzkk19tFGRR_pVa_0G65aGueTKI1qKv_I7RoIeWf9rYoRJXgA7tm-5EmrKUDLbWa48G1x6QYEHqY1Oq_QSmphBuu7zbpWcVTo6H2EDH5rz_gsoJ_vIoYDD_IaKZmGFvj3E2gYg_dFvsCNOGU65fMsp0fC8DwHBX1YEgZB-q3qhtry9jSCScHiYpKZtnocoPwxlpC9doKVCiTa5Z-Hk8v_8_2DB4" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                    <span className="bg-tertiary text-on-tertiary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Premium Access</span>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold tracking-tight mb-1">Explorer Day Pass</h3>
                                    <p className="text-on-surface-variant text-sm flex items-center gap-2">
                                        <span className="material-symbols-outlined text-xs">calendar_today</span>
                                        {displayDate} • {formatAmPm(bookingState.slot?.startTime)}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-on-surface-variant">Adult Tickets (x{bookingState.adults || 0})</span>
                                        <span className="font-medium">₹{(bookingState.adults || 0) * (prices.ADULT || 800)}.00</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-on-surface-variant">Children Tickets (x{bookingState.children || 0})</span>
                                        <span className="font-medium">₹{(bookingState.children || 0) * (prices.CHILD || 500)}.00</span>
                                    </div>

                                    {/* Additional Addons */}
                                    {(bookingState.availableAddons || []).map(addon => bookingState.selectedAddons?.[addon.id] && (
                                        <div key={addon.id} className="flex justify-between items-center text-sm">
                                            <span className="text-on-surface-variant">{addon.name} {addon.type === 'PER_PERSON' ? `(x${bookingState.adults + bookingState.children})` : ''}</span>
                                            <span className="font-medium">₹{addon.type === 'PER_PERSON' ? addon.price * (bookingState.adults + bookingState.children) : addon.price}.00</span>
                                        </div>
                                    ))}


                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-on-surface-variant">Conservation Levy</span>
                                        <span className="font-medium">₹100.00</span>
                                    </div>

                                    <div className="pt-4 border-t border-surface-container-high flex justify-between items-end">
                                        <div>
                                            <span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Total Amount</span>
                                            <span className="text-3xl font-extrabold tracking-tighter text-emerald-900">₹{finalTotal}.00</span>
                                        </div>
                                        <span className="text-xs text-on-surface-variant pb-1">Tax included</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={processing}
                                    className={`w-full bg-primary text-on-primary py-4 rounded-lg font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[0.98] transition-all flex items-center justify-center gap-3 ${processing ? 'opacity-80' : ''}`}>
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{processing ? 'hourglass_top' : 'verified_user'}</span>
                                    {processing ? 'Processing Execution...' : `Authenticate & Pay ₹${finalTotal}.00`}
                                </button>
                                <div className="flex justify-center items-center gap-6 opacity-40">
                                    <span className="material-symbols-outlined text-3xl">brand_family</span>
                                    <span className="material-symbols-outlined text-3xl">garden_cart</span>
                                    <span className="material-symbols-outlined text-3xl">payments</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-start gap-4 p-4 text-xs text-on-surface-variant leading-tight">
                            <span className="material-symbols-outlined text-emerald-700">shield</span>
                            <p>Your payment information is encrypted and never stored on our servers. Transactions are handled via world-class PCI-compliant financial partners.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-stone-200/50 dark:border-stone-800/50 bg-stone-100 dark:bg-stone-900 mt-auto">
                <div className="flex flex-col md:flex-row justify-between items-center px-12 py-8 w-full max-w-7xl mx-auto">
                    <div className="text-lg font-bold text-emerald-900 mb-4 md:mb-0">Civic Naturalist</div>
                    <div className="flex flex-wrap justify-center gap-8 mb-6 md:mb-0">
                        <a className="font-public-sans text-sm uppercase tracking-widest text-stone-500 hover:text-emerald-600 transition-all font-semibold" href="#">Privacy Policy</a>
                        <a className="font-public-sans text-sm uppercase tracking-widest text-stone-500 hover:text-emerald-600 transition-all font-semibold" href="#">Accessibility</a>
                        <a className="font-public-sans text-sm uppercase tracking-widest text-stone-500 hover:text-emerald-600 transition-all font-semibold" href="#">Terms of Service</a>
                        <a className="font-public-sans text-sm uppercase tracking-widest text-stone-500 hover:text-emerald-600 transition-all font-semibold" href="#">Contact Us</a>
                    </div>
                    <p className="font-public-sans text-xs uppercase tracking-widest text-stone-400 text-center md:text-right">
                        © 2024 Civic Naturalist Botanical Gardens &amp; Zoo.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PaymentPage;
