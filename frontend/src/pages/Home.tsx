import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Home() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>Oddslab - Track Smart Money on Polymarket | 追踪 Polymarket 智能钱</title>
        <meta name="description" content="追踪 Polymarket 智能钱地址的实时交易动态和持仓数据。发现顶级交易者策略，复制成功投资组合。Oddslab 帮你追踪智能钱，发现下一个 Polymarket 机会。" />
        <meta property="og:title" content="Oddslab - Track Smart Money on Polymarket" />
        <meta property="og:description" content="追踪 Polymarket 智能钱地址的实时交易动态和持仓数据。发现顶级交易者策略，复制成功投资组合。" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://oddslab.com" />
        <meta property="og:image" content="https://oddslab.com/og-image.png" />
        <meta property="og:site_name" content="Oddslab" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://oddslab.com" />
        <meta name="twitter:title" content="Oddslab - Track Smart Money on Polymarket" />
        <meta name="twitter:description" content="追踪 Polymarket 智能钱地址的实时交易动态和持仓数据。发现顶级交易者策略，复制成功投资组合。" />
        <meta name="twitter:image" content="https://oddslab.com/og-image.png" />
        <link rel="canonical" href="https://oddslab.com/" />
      </Helmet>
      <div className="relative flex flex-col bg-background min-h-screen">
      {/* PREMIUM HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden border-b border-border">
        {/* Dynamic Background Layers */}
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none dark:opacity-100 opacity-20" />
        <div className="absolute inset-0 cyber-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
        <div className="hud-noise inset-0 absolute opacity-[0.05]" />

        {/* Cinematic Light Sweeps */}
        <div className="absolute top-[20%] -left-[10%] w-[50%] h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent rotate-[30deg] animate-pulse" />
        <div className="absolute bottom-[20%] -right-[10%] w-[50%] h-[1px] bg-gradient-to-r from-transparent via-neon-purple/40 to-transparent -rotate-[30deg] animate-pulse" style={{ animationDelay: '1.5s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-20 py-20">
          <div className="grid lg:grid-cols-12 gap-16 items-center">

            {/* LEFT COLUMN: Kinetic Content */}
            <div className="lg:col-span-7 space-y-12">
              <div className="inline-flex items-center gap-4 px-4 py-1.5 bg-card border border-border backdrop-blur-md skew-x-[-6deg]">
                <div className="relative flex items-center justify-center">
                  <span className="w-2 h-2 bg-neon-green rounded-full animate-ping absolute" />
                  <span className="w-2 h-2 bg-neon-green rounded-full relative" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/60 skew-x-[6deg]">
                  {t('hero.badge')} <span className="text-neon-cyan">v4.0_Live</span>
                </span>
              </div>

              <div className="relative group">
                {/* Kinetic Headline Background Echoes */}
                <h1 className="absolute -top-6 -left-4 text-7xl md:text-9xl font-display font-black text-outline-white opacity-5 select-none pointer-events-none uppercase italic tracking-tighter">
                  {t('hero.deco_whales')}
                </h1>
                <h1 className="absolute -bottom-6 left-12 text-7xl md:text-9xl font-display font-black text-outline-cyan opacity-5 select-none pointer-events-none uppercase italic tracking-tighter">
                  {t('hero.deco_trades')}
                </h1>

                <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-[0.85] uppercase text-foreground italic relative z-10">
                  {t('hero.title_part1')} <span className="text-neon-cyan glow-text-cyan relative inline-block">
                    {t('hero.title_part2')}
                    <span className="absolute -inset-1 bg-neon-cyan/10 blur-xl -z-10 animate-pulse-slow" />
                  </span>,<br />
                  {t('hero.title_part3')} <span className="text-neon-green glow-text-green">{t('hero.title_highlight')}</span>
                </h1>
              </div>

              <p className="text-lg md:text-xl text-foreground/50 max-w-xl leading-relaxed font-bold uppercase tracking-tight italic border-l-2 border-border pl-6">
                {t('hero.subtitle1')}
                <span className="text-foreground block mt-2">{t('hero.subtitle2')}</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <Button size="lg" variant="primary" to="/register" className="h-16 px-12 text-sm shadow-neon-green/20">
                  {t('hero.cta_launch')}
                </Button>
                <Button size="lg" variant="cyber" to="/explore" className="h-16 px-12 text-sm">
                  {t('hero.cta_docs')}
                </Button>
              </div>
            </div>

            {/* RIGHT COLUMN: Premium HUD Terminal */}
            <div className="lg:col-span-5 perspective-1000 hidden lg:block">
              <div className="relative preserve-3d animate-float-slow">
                {/* HUD Shadow/Glow Base */}
                <div className="absolute inset-0 bg-neon-cyan/5 blur-[100px] rounded-full translate-z-[-50px]" />

                {/* MAIN HUD CARD */}
                <Card className="relative overflow-hidden border-neon-cyan/20 bg-card/40 backdrop-blur-2xl p-0 skew-x-[-2deg] shadow-hud">
                  <div className="hud-scanline absolute inset-0 z-20" />
                  <div className="hud-noise absolute inset-0 opacity-5 z-20" />

                  {/* HUD Header */}
                  <div className="bg-foreground/5 px-6 py-4 flex justify-between items-center border-b border-border relative z-30">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500/50" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                      <div className="w-2 h-2 rounded-full bg-neon-green/50" />
                    </div>
                    <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-[0.3em]">{t('hero.hud.status')}</span>
                  </div>

                  <div className="p-8 space-y-8 relative z-30">
                    {/* Metric 1 */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{t('hero.hud.metric_label')}</span>
                        <span className="text-[10px] font-mono text-neon-green">{t('hero.hud.sync')}</span>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-5xl font-mono font-black text-neon-green drop-shadow-[0_0_20px_rgba(0,255,136,0.5)] glow-text-green">+$2.48M</span>
                        <span className="text-xs font-mono text-neon-green/50">▲ 12.4%</span>
                      </div>
                    </div>

                    {/* Visual Divider / Graph Line */}
                    <div className="h-24 w-full relative overflow-hidden bg-foreground/[0.03] border border-border/5 rounded-sm group mt-10">
                      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <path d="M0 60 Q 50 10, 100 45 T 200 5 T 300 35 T 400 0" fill="none" stroke="url(#lineGradient)" strokeWidth="3" className="animate-shimmer drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
                        <defs>
                          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#00f0ff00" />
                            <stop offset="50%" stopColor="#00f0ff" />
                            <stop offset="100%" stopColor="#00f0ff00" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 bg-gradient-to-t from-neon-cyan/5 to-transparent opacity-30" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[8px] font-mono text-foreground/5 uppercase tracking-[1.5em] animate-pulse">{t('hero.hud.scanning')}</span>
                      </div>
                    </div>

                    {/* HUD Footer Info */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="bg-foreground/5 p-3 skew-x-[-6deg] border border-border">
                        <div className="skew-x-[6deg]">
                          <div className="text-[8px] text-foreground/30 uppercase mb-1">{t('hero.hud.active_rooms')}</div>
                          <div className="text-lg font-mono font-bold text-neon-cyan">1,284</div>
                        </div>
                      </div>
                      <div className="bg-foreground/5 p-3 skew-x-[-6deg] border border-border">
                        <div className="skew-x-[6deg]">
                          <div className="text-[8px] text-foreground/30 uppercase mb-1">{t('hero.hud.target_wallets')}</div>
                          <div className="text-lg font-mono font-bold text-neon-purple">8.4k</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Corner Accent Decoration */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-neon-cyan/20 to-transparent -translate-y-1/2 translate-x-1/2 rotate-45 pointer-events-none" />
                </Card>

                {/* Satellite Tags */}
                <div className="absolute -top-10 -right-10 px-4 py-2 bg-card border border-neon-purple text-[9px] font-mono text-neon-purple shadow-neon-purple/20 rotate-12">
                  {t('hero.hud.crypto_active')}
                </div>
                <div className="absolute -bottom-6 -left-12 px-4 py-2 bg-card border border-neon-cyan/50 text-[9px] font-mono text-neon-cyan shadow-neon-cyan/20 -rotate-6">
                  {t('hero.hud.signal_strength')}: 98%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REMAINDER OF SECTIONS (Features, CTA) - Kept Clean */}
      <section className="py-32 bg-muted/50 border-b border-border relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 italic text-foreground">
              {t('features.title')} <span className="text-neon-cyan">{t('features.title_highlight')}</span>
            </h2>
            <p className="text-foreground/30 font-bold uppercase tracking-[0.4em] text-[10px]">{t('features.badge')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                id: 'INTEL-01',
                title: t('features.telemetry.title'),
                desc: t('features.telemetry.desc'),
                glow: 'neon-green',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                id: 'INTEL-02',
                title: t('features.neural.title'),
                desc: t('features.neural.desc'),
                glow: 'neon-cyan',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              {
                id: 'INTEL-03',
                title: t('features.shield.title'),
                desc: t('features.shield.desc'),
                glow: 'neon-purple',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              }
            ].map((feature) => (
              <Card key={feature.id} hover className="p-10 border-border bg-card group">
                <div className="flex flex-col h-full">
                  <div className={`w-12 h-12 mb-8 bg-muted border-2 border-border flex items-center justify-center text-foreground group-hover:border-${feature.glow} transition-colors`}>
                    {feature.icon}
                  </div>
                  <div className="text-[9px] font-mono text-foreground/20 mb-2 uppercase tracking-widest">{feature.id}</div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-foreground hover:text-neon-cyan transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/40 text-sm font-medium leading-relaxed uppercase tracking-wide">
                    {feature.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-40 relative overflow-hidden bg-background">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[400px] bg-neon-cyan/5 blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-12 leading-[0.85] text-foreground">
            {t('cta.title')} <span className="text-neon-cyan glow-text-cyan italic">{t('cta.title_highlight')}</span> {t('cta.title_suffix')}
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button size="lg" variant="primary" to="/register" className="h-20 px-16 text-xl">
              {t('cta.button_launch')}
            </Button>
            <Button size="lg" variant="outline" to="/login" className="h-20 px-16 text-xl">
              {t('cta.button_sync')}
            </Button>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
