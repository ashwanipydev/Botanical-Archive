import React, { useState, useEffect } from 'react';
import api from '../../../core/services/api';
import './Gatekeeper.css';
import { Html5QrcodeScanner } from "html5-qrcode";

const GatekeeperDashboard = () => {
    const [bookingId, setBookingId] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [occupancy, setOccupancy] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    const fetchOccupancy = async () => {
        try {
            const res = await api.get('/gatekeeper/occupancy');
            setOccupancy(res.data.occupancy);
        } catch (err) {
            console.error('Failed to fetch occupancy', err);
        }
    };

    useEffect(() => {
        fetchOccupancy();
    }, []);

    const startScanner = () => {
        setShowScanner(true);
        setTimeout(() => {
            const scanner = new Html5QrcodeScanner("reader", { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            });

            const onScanSuccess = (decodedText) => {
                console.log(`Scan Result: ${decodedText}`);
                // Format: BOOKING_ID:N
                if (decodedText.startsWith('BOOKING_ID:')) {
                    const id = decodedText.split(':')[1];
                    setBookingId(id);
                    scanner.clear();
                    setShowScanner(false);
                    // Explicitly call verify with the and id
                    triggerVerify(id);
                } else {
                    alert('Invalid QR Code format: ' + decodedText);
                }
            };

            scanner.render(onScanSuccess, (err) => {
                // Ignore errors during scanning
            });
        }, 300);
    };

    const triggerVerify = async (id) => {
        setLoading(true);
        setError(null);
        setVerificationResult(null);

        try {
            const res = await api.get(`/gatekeeper/verify/${id}`);
            setVerificationResult(res.data);
            fetchOccupancy();
        } catch (err) {
            console.error('[Gatekeeper] Verification error:', err);
            setError(err.response?.data?.message || 'Verification failed. Please check the Booking ID.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        if (!bookingId) return;
        triggerVerify(bookingId);
    };

    const handleCheckIn = async () => {
        try {
            const res = await api.post(`/gatekeeper/check-in/${bookingId}`);
            alert(res.data.message);
            handleVerify(); // Refresh status
            fetchOccupancy();
        } catch (err) {
            alert(err.response?.data?.message || 'Check-in failed');
        }
    };

    const handleCheckOut = async () => {
        try {
            const res = await api.post(`/gatekeeper/check-out/${bookingId}`);
            alert(res.data.message);
            handleVerify(); // Refresh status
            fetchOccupancy();
        } catch (err) {
            alert(err.response?.data?.message || 'Check-out failed');
        }
    };

    return (
        <div className="gatekeeper-container p-8 max-w-4xl mx-auto">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-emerald-900 mb-2">Gatekeeper Dashboard</h1>
                    <p className="text-stone-500">Scan QR or enter Booking ID to verify entry/exit.</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-right">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Current Occupancy</p>
                    <p className="text-4xl font-black text-emerald-900">{occupancy} <span className="text-sm font-bold text-emerald-700/50">Visitors</span></p>
                </div>
            </header>

            <form onSubmit={handleVerify} className="mb-12 flex gap-4">
                <input 
                    type="text" 
                    placeholder="Enter Booking ID (e.g. 101)" 
                    className="flex-1 p-4 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-emerald-500"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                />
                <button 
                    type="button"
                    onClick={startScanner}
                    className="bg-emerald-100 text-emerald-700 px-6 py-4 rounded-xl font-bold hover:bg-emerald-200 transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">qr_code_scanner</span>
                    Scan QR
                </button>
                <button 
                    type="submit" 
                    className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                    disabled={loading}
                >
                    {loading ? 'Verifying...' : 'Verify Ticket'}
                </button>
            </form>

            {showScanner && (
                <div className="mb-12 bg-black rounded-3xl overflow-hidden relative shadow-2xl animate-in fade-in duration-500">
                    <div id="reader" style={{ width: '100%' }}></div>
                    <button 
                        onClick={() => setShowScanner(false)}
                        className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/40 transition-all"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <div className="absolute bottom-6 left-0 right-0 text-center">
                        <p className="text-white/70 text-xs font-bold uppercase tracking-widest drop-shadow-md">Align QR code within the frame</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl mb-8 flex items-center gap-4">
                    <span className="material-symbols-outlined text-red-500">error</span>
                    {error}
                </div>
            )}

            {verificationResult && (
                <div className={`p-8 rounded-2xl shadow-xl border-t-8 ${verificationResult.valid ? 'bg-white border-emerald-500' : 'bg-stone-50 border-stone-300'}`}>
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${verificationResult.valid ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'}`}>
                                {verificationResult.valid ? 'Valid Ticket' : 'Invalid / Expired'}
                            </span>
                            <h2 className="text-2xl font-bold mt-4 text-stone-900">{verificationResult.guestName || 'Registered Guest'}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Booking ID</p>
                            <p className="text-2xl font-black text-stone-900">#{verificationResult.bookingId}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div className="bg-stone-50 p-4 rounded-xl">
                            <p className="text-xs text-stone-400 font-bold uppercase mb-2">Headcount</p>
                            <div className="flex gap-4">
                                <div>
                                    <p className="text-lg font-bold text-stone-800">{verificationResult.tickets?.adults || 0}</p>
                                    <p className="text-[10px] text-stone-500 uppercase">Adults</p>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-stone-800">{verificationResult.tickets?.children || 0}</p>
                                    <p className="text-[10px] text-stone-500 uppercase">Children</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-stone-50 p-4 rounded-xl">
                            <p className="text-xs text-stone-400 font-bold uppercase mb-2">Visit Status</p>
                            <div className="flex gap-4">
                                <div>
                                    <p className="text-sm font-bold text-stone-800">{verificationResult.checkedInAt === 'NOT_IN' ? '—' : 'Checked In'}</p>
                                    <p className="text-[10px] text-stone-500 uppercase">{verificationResult.checkedInAt === 'NOT_IN' ? 'Entry Pending' : verificationResult.checkedInAt}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {verificationResult.valid && verificationResult.checkedInAt === 'NOT_IN' && (
                            <button 
                                onClick={handleCheckIn}
                                className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">login</span>
                                Confirm Entry (Get In)
                            </button>
                        )}
                        {verificationResult.valid && verificationResult.checkedInAt !== 'NOT_IN' && verificationResult.checkedOutAt === 'NOT_OUT' && (
                            <button 
                                onClick={handleCheckOut}
                                className="flex-1 py-4 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-900 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">logout</span>
                                Confirm Exit (Get Out)
                            </button>
                        )}
                        {verificationResult.valid && verificationResult.checkedOutAt !== 'NOT_OUT' && (
                            <div className="flex-1 py-4 bg-stone-100 text-stone-500 font-bold rounded-xl text-center border border-dashed border-stone-300">
                                Visit Completed
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GatekeeperDashboard;
