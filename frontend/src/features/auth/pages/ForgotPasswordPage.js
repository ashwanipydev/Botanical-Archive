import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../core/services/api';
import './AuthPages.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        try {
            await api.post(`/auth/forgot-password?email=${email}`);
            setMessage('Password reset link has been sent to your email. Please check your inbox (and console if using mock).');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset link. Please check the email and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background text-on-surface min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
                <img alt="The Civic Naturalist Conservatory" className="w-full h-full object-cover opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzQ_snZZH_tX2lKuKgS_YY_a7CZ54uZTsaiXy4NjhN2LQ7bM2iUKIJn4DGBGxtGa-eFIqvl3gkeQzDQn8DgUWSR1MzDAAJF5cfK9pb1oomznirLz938OVi-wgfmNP_sJ8P9WARzfyuR5_tA5fPt1tPP0PlLoCgpiJegV5k9QcFTiflOmi-7BT4yMTuml8HWYdd5jlVQqQ1x9TfzekoBv1CVGU3Og0rMgVfj4HHF89ltv-emIOZU93LvO6EVEYEUyDFtdVgeDw8sqU" />
            </div>

            <main className="z-10 w-full max-w-lg px-6">
                <div className="glass-card surface-container-lowest ambient-shadow rounded-xl p-10 flex flex-col gap-8 border border-white/20">
                    <header>
                        <h2 className="text-2xl font-bold tracking-tight text-on-surface">Forgot Password</h2>
                        <p className="text-on-surface-variant text-sm mt-1">Enter your email address to receive a reset link.</p>
                        {message && <div className="text-emerald-700 text-xs font-bold mt-2 bg-emerald-50 p-2 rounded border border-emerald-200">{message}</div>}
                        {error && <div className="text-error text-xs font-bold mt-2 bg-error-container/20 p-2 rounded">{error}</div>}
                    </header>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email Address</label>
                            <input
                                className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary"
                                placeholder="naturalist@institution.org"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="mt-4 w-full bg-primary text-on-primary font-semibold py-4 rounded-lg shadow-sm hover:bg-primary-dim active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <footer className="text-center">
                        <Link className="text-sm text-primary font-bold hover:underline underline-offset-4 decoration-2" to="/login">Back to Sign In</Link>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default ForgotPasswordPage;
