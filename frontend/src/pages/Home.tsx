import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Home() {
  return (
    <div className="relative flex flex-col">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-40 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />

        {/* Animated Light Trails - Subtler */}
        <div className="absolute top-1/4 left-[-10%] w-[120%] h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/10 to-transparent rotate-[-15deg] animate-pulse" />
        <div className="absolute top-3/4 left-[-10%] w-[120%] h-[1px] bg-gradient-to-r from-transparent via-neon-purple/10 to-transparent rotate-[15deg] animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-8 px-3 py-1 bg-midnight-900 border border-neon-cyan/30 skew-x-[-6deg]">
              <span className="w-1.5 h-1.5 bg-neon-cyan animate-pulse shadow-neon-cyan skew-x-[6deg]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neon-cyan skew-x-[6deg]">Live Network Active</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-display font-black tracking-tighter mb-8 leading-[0.9] uppercase text-white">
              Watch the <span className="text-neon-cyan glow-text-cyan">Whales</span>,<br />
              Win the <span className="text-neon-green glow-text-green">Trades.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 mb-12 max-w-xl leading-relaxed uppercase font-bold italic tracking-tight">
              Real-time intelligence for high-stakes markets. Track the most profitable traders on Polymarket.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="primary" to="/register" className="h-14 px-8">
                Sign Up Now
              </Button>
              <Button size="lg" variant="cyber" to="/explore" className="h-14 px-8">
                Explore Rooms
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Stat Card - Enlarged and Adjusted */}
        <div className="hidden lg:block absolute right-24 top-1/2 -translate-y-1/2 animate-float">
          <Card className="w-80 p-8 border-white/10 bg-midnight-950/80 backdrop-blur-md skew-x-[-6deg] shadow-neon-cyan/20">
            <div className="skew-x-[6deg]">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-bold text-neon-cyan uppercase tracking-widest">Global Profits</span>
                <span className="text-[10px] font-mono text-white/20">24H</span>
              </div>
              <div className="text-5xl font-mono font-black text-neon-green">+$2.48M</div>
              <div className="mt-3 text-[10px] text-white/40 uppercase font-bold tracking-widest">Aggregate Whale Earnings</div>
            </div>
          </Card>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-32 bg-midnight-900 border-b border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 italic text-white flex justify-center gap-3">
              THE <span className="text-neon-cyan">ADVANTAGE</span>
            </h2>
            <p className="text-white/30 font-bold uppercase tracking-[0.3em] text-[10px]">Real-Time Edge in Prediction Markets</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                id: '01',
                title: 'Whale Tracking',
                desc: 'Real-time monitoring of the world\'s most successful prediction market traders.',
                glow: 'neon-green',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                id: '02',
                title: 'Market Intelligence',
                desc: 'Merged chain data and market sentiment to reveal hidden trends before they move.',
                glow: 'neon-cyan',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              {
                id: '03',
                title: 'Risk Management',
                desc: 'Advanced detection of bot activity and market manipulation to protect your capital.',
                glow: 'neon-purple',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              }
            ].map((feature) => (
              <Card key={feature.id} hover className="p-10 border-white/5 bg-midnight-950/40">
                <div className="flex flex-col h-full">
                  <div className={`w-12 h-12 mb-8 skew-x-[-6deg] bg-midnight-800 border-2 border-white/5 flex items-center justify-center text-white`}>
                    <div className="skew-x-[6deg]">{feature.icon}</div>
                  </div>
                  <h3 className={`text-2xl font-black uppercase tracking-tighter mb-4 text-white hover:text-neon-cyan transition-colors`}>
                    {feature.title}
                  </h3>
                  <p className="text-white/40 text-sm font-medium leading-relaxed uppercase tracking-wide">
                    {feature.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-midnight-950 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-neon-cyan/5 blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-10 leading-[0.9] text-white">
            READY TO JOIN THE <span className="text-neon-cyan glow-text-cyan">1%?</span>
          </h2>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" variant="primary" to="/register" className="h-16 px-12">
              Get Started
            </Button>
            <Button size="lg" variant="outline" to="/login" className="h-16 px-12">
              Login
            </Button>
          </div>

          <p className="mt-12 text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">
            Oddslab • Real-Time Whale Intel
          </p>
        </div>
      </section>
    </div>
  );
}
