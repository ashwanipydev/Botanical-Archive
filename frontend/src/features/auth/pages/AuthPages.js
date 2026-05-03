import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import './AuthPages.css';

/* ─── Shared split-screen shell ─────────────────────────────────────────── */
const AuthShell = ({ children, leftBadge, leftTitle, leftBody, leftFooter }) => (
    <div className="relative min-h-dvh bg-background text-on-surface">
        {/* Full-bleed background */}
        <div className="absolute inset-0 pointer-events-none">
            <img
                alt="Botanical conservatory"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzQ_snZZH_tX2lKuKgS_YY_a7CZ54uZTsaiXy4NjhN2LQ7bM2iUKIJn4DGBGxtGa-eFIqvl3gkeQzDQn8DgUWSR1MzDAAJF5cfK9pb1oomznirLz938OVi-wgfmNP_sJ8P9WARzfyuR5_tA5fPt1tPP0PlLoCgpiJegV5k9QcFTiflOmi-7BT4yMTuml8HWYdd5jlVQqQ1x9TfzekoBv1CVGU3Og0rMgVfj4HHF89ltv-emIOZU93LvO6EVEYEUyDFtdVgeDw8sqU"
            />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(23,57,1,0.92),rgba(23,57,1,0.62)_38%,rgba(23,57,1,0.22)_72%,rgba(250,250,245,0.08))]" />
            <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-secondary-container/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-tertiary/15 blur-3xl" />
        </div>

        {/* Two-column layout: centered editorial (desktop only) + form card */}
        <main className="relative z-10 flex min-h-dvh items-center justify-center max-w-7xl mx-auto px-4 py-4 sm:px-8 lg:px-16 lg:gap-24">
            {/* Left editorial — hidden below lg */}
            <section className="hidden lg:flex lg:flex-col flex-1 max-w-lg text-white">
                {leftBadge && (
                    <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-5 py-2.5 backdrop-blur-md self-start">
                        <span className="material-symbols-outlined text-lg text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.24em] text-white/80">{leftBadge}</span>
                    </div>
                )}
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.28em] text-white/55">{leftTitle}</p>
                <h1 className="max-w-[12ch] text-4xl xl:text-6xl font-black tracking-tighter text-white xl:leading-[0.92]">
                    {leftBody}
                </h1>
                <p className="mt-5 max-w-md text-sm font-medium leading-7 text-white/70">{leftFooter}</p>
                <div className="mt-8 flex flex-wrap items-center gap-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/55">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-secondary-container animate-pulse" />
                        Systems operational
                    </div>
                    <button type="button" className="transition hover:text-white">Security protocol</button>
                    <button type="button" className="transition hover:text-white">Help centre</button>
                </div>
            </section>

            {/* Right form card */}
            <section className="w-full max-w-md mx-auto lg:mx-0 flex-shrink-0">
                {children}
            </section>
        </main>
    </div>
);

/* ─── Glass card wrapper shared by both pages ───────────────────────────── */
const AuthCard = ({ headerLabel, headerTitle, headerDesc, error, children }) => (
    <div className="glass-card ambient-shadow overflow-hidden rounded-[2rem] border border-white/25 bg-white/90 shadow-[0_32px_80px_rgba(23,57,1,0.22)]">
        <div className="bg-surface-container-low px-8 py-2 md:px-10">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-on-surface-variant/60 mb-0.5">{headerLabel}</p>
            <h2 className="text-xl font-black tracking-tight text-primary">{headerTitle}</h2>
            <p className="mt-0.5 text-xs font-medium text-on-surface-variant">{headerDesc}</p>
        </div>
        <div className="space-y-2 px-8 py-3 md:px-10">
            {error && (
                <div className="rounded-2xl bg-error-container px-4 py-3 text-sm font-semibold text-error">
                    {error}
                </div>
            )}
            {children}
        </div>
    </div>
);

/* ─── Login Page ─────────────────────────────────────────────────────────── */
export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(email, password);
            const roles = data.roles || [];
            if (roles.includes('ROLE_ADMIN')) navigate('/admin');
            else if (roles.includes('ROLE_GATEKEEPER')) navigate('/staff/gatekeeper');
            else if (roles.some(r => ['ROLE_SLOTS', 'ROLE_PRICING', 'ROLE_BOOKINGS', 'ROLE_ANALYTICS'].includes(r))) navigate('/admin');
            else navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            leftBadge="Civic Naturalist Archive"
            leftTitle="Staff and curator access"
            leftBody="Enter the Botanical Archive."
            leftFooter="Your editorial workspace for bookings, analytics, pricing, and stewardship operations."
        >
            <AuthCard
                headerLabel="Portal access"
                headerTitle="Sign In"
                headerDesc="Access your naturalist workspace and protected collections."
                error={error}
            >
                <form onSubmit={handleSubmit} className="space-y-1.5">
                    <div className="input-group">
                        <label className="text-[9px] font-black uppercase tracking-[0.18em] text-on-surface-variant/60">Email address</label>
                        <input
                            className="input-field bg-surface-container-low !py-2.5"
                            placeholder="naturalist@institution.org"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <div className="flex items-center justify-between">
                            <label className="text-[9px] font-black uppercase tracking-[0.18em] text-on-surface-variant/60">Password</label>
                            <Link
                                className="text-[10px] font-black uppercase tracking-[0.18em] text-primary transition hover:text-secondary"
                                to="/forgot-password"
                            >
                                Forgot password
                            </Link>
                        </div>
                        <input
                            className="input-field bg-surface-container-low"
                            placeholder="••••••••"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="rounded-2xl bg-surface-container-low px-4 py-1.5">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                            <div>
                                <p className="text-sm font-black tracking-tight text-primary">Protected curator access</p>
                                <p className="mt-0.5 text-xs font-medium leading-5 text-on-surface-variant">Roles are routed automatically after sign-in.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn--primary w-full justify-center py-2.5 text-[11px] shadow-organic-xl disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        <span className="material-symbols-outlined text-lg">login</span>
                        {loading ? 'Signing in...' : 'Continue to portal'}
                    </button>
                </form>

                <div className="relative flex items-center">
                    <div className="flex-1 border-t border-outline-variant/35" />
                    <span className="px-4 text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant/60">or connect with</span>
                    <div className="flex-1 border-t border-outline-variant/35" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button type="button" className="flex items-center justify-center gap-2 rounded-[1.25rem] bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface transition hover:bg-surface-container-high">
                        <img
                            alt="Google"
                            className="h-5 w-5"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBY7vrIxuZwyuALPbPGL1R7mWTTOTKtZuJmt2d9Mp7fnNC5J7pHKzrULZRjj6wuLow4mrUIrcOXzbBzJJoekgUS21Qvf7ips2DO--g_JbE8c8xmBPfQpM3AmWmo3i1UPrNR8RF9oraXGqXgJo-17TAnDTVkVHW6kAk5NefjwCzznnXXKKjVT_WPAz7nHMHiSoFpyXw6LaSu1ZOlZvy2yLWu6UxZt9ocDwNIe5wz_bdIc0ETilxiGZbEGCUprw7Tt-JGy-J85KJuFhM"
                        />
                        Google
                    </button>
                    <button type="button" className="flex items-center justify-center gap-2 rounded-[1.25rem] bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface transition hover:bg-surface-container-high">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>ios</span>
                        Apple
                    </button>
                </div>

                <footer className="flex flex-col gap-1.5 border-t border-outline-variant/20 pt-2 text-xs text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        New to the institution?{' '}
                        <Link className="font-bold text-primary hover:underline" to="/signup">Create an account</Link>
                    </p>
                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-[0.16em]">
                        <button type="button" className="transition hover:text-primary">Privacy</button>
                        <button type="button" className="transition hover:text-primary">Terms</button>
                    </div>
                </footer>
            </AuthCard>
        </AuthShell>
    );
};

/* ─── Signup Page ────────────────────────────────────────────────────────── */
export const SignupPage = () => {
    const [form, setForm] = useState({ fullName: '', email: '', password: '', mobileNumber: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signup(form.fullName, form.email, form.password, form.mobileNumber);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            leftBadge="Civic Naturalist Archive"
            leftTitle="Join the ecologist network"
            leftBody="Begin your naturalist journey."
            leftFooter="Create your account to access the booking registry, track your visits, and support our global conservation mandate."
        >
            <AuthCard
                headerLabel="New registration"
                headerTitle="Create Account"
                headerDesc="Join the Civic Naturalist community today."
                error={error}
            >
                <form onSubmit={handleSubmit} className="space-y-1.5">
                    <div className="input-group">
                        <label className="text-[9px] font-black uppercase tracking-[0.18em] text-on-surface-variant/60">Full Name</label>
                        <input
                            className="input-field bg-surface-container-low !py-2.5"
                            placeholder="John Doe"
                            type="text"
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="input-group">
                            <label className="text-[9px] font-black uppercase tracking-[0.18em] text-on-surface-variant/60">Email Address</label>
                            <input
                                className="input-field bg-surface-container-low !py-2.5"
                                placeholder="name@example.com"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="text-[9px] font-black uppercase tracking-[0.18em] text-on-surface-variant/60">Mobile Number</label>
                            <input
                                className="input-field bg-surface-container-low !py-2.5"
                                placeholder="+91-9876543210"
                                type="tel"
                                name="mobileNumber"
                                value={form.mobileNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="text-[9px] font-black uppercase tracking-[0.18em] text-on-surface-variant/60">Password</label>
                        <input
                            className="input-field bg-surface-container-low !py-2.5"
                            placeholder="Min 6 characters"
                            type="password"
                            name="password"
                            minLength={6}
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="rounded-2xl bg-surface-container-low px-4 py-1.5">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                            <div>
                                <p className="text-sm font-black tracking-tight text-primary">Conservation first</p>
                                <p className="mt-0.5 text-xs font-medium leading-5 text-on-surface-variant">
                                    Your membership directly funds global biodiversity initiatives.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn--primary w-full justify-center py-2.5 text-[11px] shadow-organic-xl disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        {loading ? 'Creating account...' : 'Create my account'}
                    </button>
                </form>

                <footer className="flex flex-col gap-1.5 border-t border-outline-variant/20 pt-2 text-xs text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        Already have an account?{' '}
                        <Link className="font-bold text-primary hover:underline" to="/login">Sign in</Link>
                    </p>
                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-[0.16em]">
                        <button type="button" className="transition hover:text-primary">Privacy</button>
                        <button type="button" className="transition hover:text-primary">Terms</button>
                    </div>
                </footer>
            </AuthCard>
        </AuthShell>
    );
};
