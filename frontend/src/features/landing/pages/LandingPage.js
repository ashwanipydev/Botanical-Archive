import React from 'react';
import { Link } from 'react-router-dom';
import api from '../../../core/services/api';

const LandingPage = () => {
  const [adultPrice, setAdultPrice] = React.useState(800);

  React.useEffect(() => {
    api.get('/public/pricing/tickets')
      .then(res => {
        if (res.data.ADULT) setAdultPrice(res.data.ADULT);
      })
      .catch(err => console.error('Error fetching landing prices:', err));
  }, []);

  return (
    <div className="bg-background text-on-surface font-body selection:bg-secondary-container min-h-screen pb-32 md:pb-0">
      {/* TopAppBar - Responsive */}
      <header className="fixed top-0 w-full z-50 bg-[#FAFAF5]/80 backdrop-blur-xl border-b border-outline-variant/10 px-6 md:px-12 py-4 flex justify-between items-center transition-all duration-500">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined md:hidden p-2 rounded-full hover:bg-stone-200/50 transition-colors">menu</span>
          <h1 className="text-xl md:text-2xl font-black tracking-tighter text-[#173901] dark:text-[#B9F395]">The Habitat Archive</h1>
        </div>
        <div className="hidden md:flex items-center space-x-10 font-label text-[11px] uppercase tracking-[0.2em] font-black">
          <a className="text-[#43493D] hover:text-[#173901] transition-all" href="#">Curated Exhibits</a>
          <a className="text-[#43493D] hover:text-[#173901] transition-all" href="#">Bio-Conservation</a>
          <a className="text-[#43493D] hover:text-[#173901] transition-all" href="#">Admission</a>
          <a className="text-[#43493D] hover:text-[#173901] transition-all" href="#">Field Guides</a>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="px-8 py-3 bg-[#173901] text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-primary/20">Access Portal</Link>
        </div>
      </header>

      <main className="pb-32 md:pb-0">
        {/* Hero Section - Asymmetrical & Responsive */}
        <section className="relative flex items-center pt-24 pb-16 md:pt-2 md:pb-24 overflow-hidden px-6 md:px-12">
          <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-[#B9F395]/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-center relative z-10">
            <div className="md:col-span-7">
              <span className="font-label text-[10px] uppercase tracking-[0.3em] text-[#43493D] mb-4 block animate-in slide-in-from-bottom duration-500 font-black">Civic Naturalist Zoo • Est. 1894</span>
              <h2 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold text-[#173901] tracking-tighter mb-6 leading-[0.9] animate-in slide-in-from-bottom duration-700 delay-100">
                Reconnect <br/><span className="text-[#396A1E]">with Nature.</span>
              </h2>
              <p className="text-base md:text-lg text-[#43493D] max-w-[40ch] mb-8 font-medium leading-[1.6] animate-in slide-in-from-bottom duration-700 delay-200">
                Experience the wild in its most pristine form through our curated botanical corridors and habitat archives.
              </p>
              <div className="flex flex-wrap gap-4 animate-in slide-in-from-bottom duration-700 delay-300">
                <Link to="/book/date" className="bg-[#173901] text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 group">
                  Book Your Visit
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
                <button className="px-8 py-4 border border-[#C3C9B9] text-[#173901] rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#F4F4EF] transition-all">Explore Habitat</button>
              </div>
            </div>

            <div className="md:col-span-5 relative mt-8 md:mt-0 group">
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-surface-container-high shadow-2xl transition-transform duration-700 group-hover:scale-[1.01]">
                <img className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" alt="Majestic Lion" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJk6JYdkqIqG7bUWsecSJCEebtop0HGsTfwNLXYiU23nDg-nm8SOmDnpLvOanMfxISDxreovivCcH9F3j2ZYjy5TmFoQht7xW8BpnAEy7Zi27wYggD5UBYGXoiy9MJsF36LjdpxPQyDXbYDkyt73oxk2YAFHseBfc0nmaX8ZD72kv5U8gD6ewaWwfqu_69iqoEheIga5FSdEYFAPXVZ1mjFn1QxQiK3gGyul71iYniZGVdwo5DmMJ4tf8VoR8gp8jo5Zm-caKo52hN" />
              </div>
              {/* Status badge - anchored inside the image column, won't overflow into text */}
              <div className="mt-4 md:absolute md:-bottom-6 md:left-4 bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] md:max-w-[220px] border border-white/40">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[#396A1E] text-base" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                  <span className="font-label text-[9px] uppercase font-black tracking-[0.15em] text-[#43493D]">Archival Status</span>
                </div>
                <p className="font-black text-xs text-[#173901] tracking-tight leading-relaxed">All Primary Habitats Currently Active &amp; Healthy</p>
              </div>
            </div>
          </div>
        </section>

        {/* Category Highlights */}
        <section className="py-12 md:py-16 px-6 md:px-12 bg-[#F4F4EF]/50">
          <div className="container mx-auto">
            <div className="flex justify-between items-end mb-16">
              <div>
                <span className="text-[#43493D] font-label text-[10px] uppercase tracking-[0.3em] font-black mb-3 block">Exploration Paths</span>
                <h3 className="text-4xl md:text-6xl font-black text-[#173901] tracking-tighter leading-none">Curated Modules</h3>
              </div>
              <button className="text-[11px] font-black text-[#396A1E] tracking-widest uppercase border-b-2 border-[#396A1E]/20 pb-2 hover:border-[#396A1E] transition-all">View Scientific Index</button>
            </div>

            <div className="flex overflow-x-auto gap-8 no-scrollbar snap-x pb-8">
              {[
                { title: 'Habitat Tours', desc: 'Guided botanical walks through our micro-climate biomes.', icon: 'park', color: 'bg-[#B9F395]/40 text-[#396A1E]' },
                { title: 'Private Safari', desc: 'Exclusive off-road access to apex predator enclosures.', icon: 'travel_explore', color: 'bg-[#C4EFA3]/40 text-[#173901]' },
                { title: 'Eco-Education', desc: 'Scientific workshops on biodiversity and preservation.', icon: 'menu_book', color: 'bg-[#FFD8E9]/40 text-[#551B3F]' }
              ].map((item, idx) => (
                <div key={idx} className="flex-none w-80 snap-start bg-white p-10 rounded-[3rem] border border-outline-variant/10 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 group">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 duration-500 ${item.color}`}>
                    <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                  </div>
                  <h4 className="text-2xl font-black text-[#173901] tracking-tight mb-4">{item.title}</h4>
                  <p className="text-sm md:text-base text-[#43493D] leading-[1.6] font-medium opacity-80">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Conservation Row */}
        <section className="py-16 md:py-20 px-6 md:px-12 bg-[#173901] text-white relative overflow-hidden">
          <div className="absolute right-[-10%] top-[-10%] w-[600px] h-[600px] border-[1px] border-white/10 rounded-full"></div>
          <div className="absolute right-[-20%] top-[-20%] w-[800px] h-[800px] border-[1px] border-white/5 rounded-full"></div>
          
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-4 bg-white/10 text-[#B9F395] px-5 py-2.5 rounded-full mb-6 border border-white/10 backdrop-blur-md">
                <span className="material-symbols-outlined text-lg" style={{fontVariationSettings: "'FILL' 1"}}>eco</span>
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Conservation First Mandate</span>
              </div>
              <h3 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6 leading-[0.95]">Preserving DNA. <br/><span className="text-[#B9F395]">Protecting Life.</span></h3>
              <p className="text-base md:text-lg text-white/80 leading-relaxed mb-8 font-medium">
                100% of admission cycles fund our global reforestation projects. We are a living seed bank for the planet's collective future.
              </p>
              <div className="grid grid-cols-2 gap-8 border-t border-white/15 pt-8">
                <div>
                  <div className="text-4xl md:text-5xl font-black mb-2">14k+</div>
                  <div className="text-[11px] uppercase tracking-[0.3em] font-black opacity-50">Acres Restored</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-black mb-2">82</div>
                  <div className="text-[11px] uppercase tracking-[0.3em] font-black opacity-50">Species Saved</div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 bg-white/5 backdrop-blur-2xl p-10 md:p-16 rounded-[4rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.3)]">
              <h4 className="text-3xl md:text-4xl font-black mb-6 tracking-tighter">Enter the Archive</h4>
              <p className="text-white/60 text-base md:text-lg leading-relaxed mb-12 font-medium">Join our ecological collective. Receive seasonal field notes and restoration audit reports directly from our sanctuary stewards.</p>
              <div className="relative">
                <input className="w-full bg-white/10 border-none rounded-3xl py-6 px-8 focus:ring-2 focus:ring-[#B9F395] text-white placeholder:text-white/30 font-bold" placeholder="Scientific Contact Address" />
                <button className="absolute right-3 top-3 bg-[#B9F395] text-[#173901] w-14 h-14 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#B9F395]/20 group">
                  <span className="material-symbols-outlined group-hover:rotate-[-20deg] transition-transform">send</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Desktop Footer */}
      <footer className="hidden md:block w-full bg-[#FAFAF5] border-t border-outline-variant/10 py-32">
        <div className="container mx-auto px-12">
          <div className="flex justify-between items-start mb-24">
            <div className="max-w-xl">
              <div className="text-3xl font-black text-[#173901] tracking-tighter mb-8 underline decoration-[#396A1E] decoration-8 underline-offset-[12px]">The Habitat Archive</div>
              <p className="text-xs text-[#43493D]/60 leading-[2] uppercase tracking-[0.25em] font-black">A high-fidelity ecological repository dedicated to the preservation of rare botanical specimens and the stabilization of primordial biomes since 1894.</p>
            </div>
            <div className="flex gap-20 text-[11px] font-black uppercase tracking-[0.3em]">
              <div className="flex flex-col gap-6">
                <a className="text-[#173901] hover:translate-x-2 transition-transform" href="#">Scientific Protocol</a>
                <a className="text-[#173901] hover:translate-x-2 transition-transform" href="#">Stewardship Index</a>
              </div>
              <div className="flex flex-col gap-6">
                <a className="text-[#173901] hover:translate-x-2 transition-transform" href="#">Habitat Safety</a>
                <a className="text-[#173901] hover:translate-x-2 transition-transform" href="#">Field Lab</a>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-[#43493D]/30 text-center border-t border-[#C3C9B9]/20 pt-16 uppercase tracking-[0.5em] font-black">
            © 2024 Civic Naturalist Botanical Sanctuary • All Scientific Operations Encrypted • Verified Biological Repository
          </div>
        </div>
      </footer>

      {/* Floating Bottom Navigator - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-10 pt-5 bg-[#FAFAF5]/95 backdrop-blur-3xl border-t border-outline-variant/10 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col items-center justify-center bg-[#173901] text-white rounded-full px-8 py-3.5 shadow-2xl shadow-primary/40 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-xl" style={{fontVariationSettings: "'FILL' 1"}}>explore</span>
          <span className="font-label font-black text-[10px] uppercase tracking-[0.2em] mt-1.5">Visit</span>
        </div>
        <Link to="/book/date" className="flex flex-col items-center justify-center text-[#43493D] opacity-40 hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-xl">confirmation_number</span>
          <span className="font-label font-black text-[10px] uppercase tracking-[0.2em] mt-1.5">Book</span>
        </Link>
        <div className="flex flex-col items-center justify-center text-[#43493D] opacity-40 hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-xl">map</span>
          <span className="font-label font-black text-[10px] uppercase tracking-[0.2em] mt-1.5">Map</span>
        </div>
        <Link to="/login" className="flex flex-col items-center justify-center text-[#43493D] opacity-40 hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-xl">account_circle</span>
          <span className="font-label font-black text-[10px] uppercase tracking-[0.2em] mt-1.5">Login</span>
        </Link>
      </nav>
    </div>
  );
};

export default LandingPage;
